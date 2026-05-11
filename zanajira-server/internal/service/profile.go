package service

import (
	"context"
	"database/sql"
)

// ProfileSection weights (must sum to 100 for full completion)
const (
	WeightPersonal     = 20
	WeightContact      = 10
	WeightAcademic     = 20
	WeightProfessional = 5
	WeightLanguage     = 10
	WeightExperience   = 10
	WeightReferees     = 10
	WeightDeclaration  = 10
	WeightBonus        = 5 // Training + Computer Skills + Attachments
)

// ProfileData holds the counts needed to compute completion.
type ProfileData struct {
	HasPersonal     bool
	HasPhoto        bool
	HasContact      bool
	AcademicCount   int
	ProfessionalCount int
	LanguageCount   int
	ExperienceCount int
	RefereeCount    int
	TrainingCount   int
	ComputerSkillCount int
	AttachmentCount int
	HasDeclaration  bool
}

// ComputeCompletion calculates the profile completion percentage.
func ComputeCompletion(d ProfileData) int {
	score := 0

	// Personal (20%): ZanID filled + photo uploaded
	if d.HasPersonal && d.HasPhoto {
		score += WeightPersonal
	} else if d.HasPersonal {
		score += WeightPersonal / 2
	}

	// Contact (10%)
	if d.HasContact {
		score += WeightContact
	}

	// Academic (20%): at least 1 qualification
	if d.AcademicCount >= 1 {
		score += WeightAcademic
	}

	// Professional (5%)
	if d.ProfessionalCount >= 1 {
		score += WeightProfessional
	}

	// Language (10%): at least 1
	if d.LanguageCount >= 1 {
		score += WeightLanguage
	}

	// Work Experience (10%)
	if d.ExperienceCount >= 1 {
		score += WeightExperience
	}

	// Referees (10%): at least 1
	if d.RefereeCount >= 1 {
		score += WeightReferees
	}

	// Declaration (10%)
	if d.HasDeclaration {
		score += WeightDeclaration
	}

	// Bonus (5%): training OR computer skills OR attachments
	if d.TrainingCount >= 1 || d.ComputerSkillCount >= 1 || d.AttachmentCount >= 1 {
		score += WeightBonus
	}

	if score > 100 {
		score = 100
	}
	return score
}

// ProfileChecker queries the DB to build ProfileData for a given applicant.
type ProfileChecker struct {
	db *sql.DB
}

func NewProfileChecker(db *sql.DB) *ProfileChecker {
	return &ProfileChecker{db: db}
}

func (p *ProfileChecker) GetProfileData(ctx context.Context, applicantID string) (ProfileData, error) {
	var d ProfileData

	// Personal details
	var zanid sql.NullString
	var photoPath sql.NullString
	err := p.db.QueryRowContext(ctx,
		`SELECT zanid, photo_path, declaration_accepted FROM applicants WHERE id=$1`, applicantID,
	).Scan(&zanid, &photoPath, &d.HasDeclaration)
	if err != nil {
		return d, err
	}
	d.HasPersonal = zanid.Valid && zanid.String != ""
	d.HasPhoto = photoPath.Valid && photoPath.String != ""

	// Contact
	var contactID sql.NullString
	_ = p.db.QueryRowContext(ctx,
		`SELECT id FROM contact_details WHERE applicant_id=$1`, applicantID,
	).Scan(&contactID)
	d.HasContact = contactID.Valid

	// Counts
	counts := []struct {
		dest  *int
		query string
	}{
		{&d.AcademicCount, `SELECT COUNT(*) FROM academic_qualifications WHERE applicant_id=$1`},
		{&d.ProfessionalCount, `SELECT COUNT(*) FROM professional_qualifications WHERE applicant_id=$1`},
		{&d.LanguageCount, `SELECT COUNT(*) FROM language_proficiencies WHERE applicant_id=$1`},
		{&d.ExperienceCount, `SELECT COUNT(*) FROM work_experiences WHERE applicant_id=$1`},
		{&d.RefereeCount, `SELECT COUNT(*) FROM referees WHERE applicant_id=$1`},
		{&d.TrainingCount, `SELECT COUNT(*) FROM trainings WHERE applicant_id=$1`},
		{&d.ComputerSkillCount, `SELECT COUNT(*) FROM computer_skills WHERE applicant_id=$1`},
		{&d.AttachmentCount, `SELECT COUNT(*) FROM other_attachments WHERE applicant_id=$1`},
	}
	for _, c := range counts {
		_ = p.db.QueryRowContext(ctx, c.query, applicantID).Scan(c.dest)
	}

	return d, nil
}

// RefreshCompletion recomputes and persists the completion percentage.
func (p *ProfileChecker) RefreshCompletion(ctx context.Context, applicantID string) (int, error) {
	data, err := p.GetProfileData(ctx, applicantID)
	if err != nil {
		return 0, err
	}
	pct := ComputeCompletion(data)
	_, err = p.db.ExecContext(ctx,
		`UPDATE applicants SET profile_completion_pct=$2, updated_at=NOW() WHERE id=$1`,
		applicantID, pct,
	)
	return pct, err
}
