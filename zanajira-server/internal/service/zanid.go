package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"
)

var ErrInvalidZanID = errors.New("invalid ZanID format — must be 9 digits")
var ErrZanIDNotFound = errors.New("ZanID not found in the national identity system")

var zanIDPattern = regexp.MustCompile(`^\d{9}$`)

// ZanIDProfile holds the personal details returned by the ZanID system.
type ZanIDProfile struct {
	ZanID       string `json:"zanid"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Sex         string `json:"sex"`
	DateOfBirth string `json:"date_of_birth"` // YYYY-MM-DD
	Nationality string `json:"nationality"`
}

// ZanIDService is the interface for ZanID lookups.
type ZanIDService interface {
	Lookup(zanid string) (*ZanIDProfile, error)
}

// ─── Mock Implementation ──────────────────────────────────────────────────────

type MockZanIDService struct{}

func NewMockZanIDService() *MockZanIDService {
	return &MockZanIDService{}
}

func (m *MockZanIDService) Lookup(zanid string) (*ZanIDProfile, error) {
	if !zanIDPattern.MatchString(zanid) {
		return nil, ErrInvalidZanID
	}
	// Return mock data for any valid 9-digit ZanID
	return &ZanIDProfile{
		ZanID:       zanid,
		FirstName:   "Juma",
		LastName:    "Mwangi",
		Sex:         "Male",
		DateOfBirth: "1990-06-15",
		Nationality: "Tanzanian",
	}, nil
}

// ─── Real Implementation ──────────────────────────────────────────────────────

type RealZanIDService struct {
	apiURL string
	apiKey string
	client *http.Client
}

func NewRealZanIDService(apiURL, apiKey string) *RealZanIDService {
	return &RealZanIDService{
		apiURL: apiURL,
		apiKey: apiKey,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (r *RealZanIDService) Lookup(zanid string) (*ZanIDProfile, error) {
	if !zanIDPattern.MatchString(zanid) {
		return nil, ErrInvalidZanID
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/citizens/%s", r.apiURL, zanid), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+r.apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ZanID service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrZanIDNotFound
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ZanID service returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var profile ZanIDProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return nil, fmt.Errorf("failed to parse ZanID response: %w", err)
	}
	return &profile, nil
}

// NewZanIDService returns the appropriate implementation based on the mock flag.
func NewZanIDService(apiURL, apiKey string, useMock bool) ZanIDService {
	if useMock {
		return NewMockZanIDService()
	}
	return NewRealZanIDService(apiURL, apiKey)
}
