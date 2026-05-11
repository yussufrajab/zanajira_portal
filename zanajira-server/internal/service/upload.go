package service

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

const (
	MaxCertSizeBytes   = 2 * 1024 * 1024 // 2MB
	MaxLetterSizeBytes = 1 * 1024 * 1024 // 1MB
)

var (
	ErrNotPDF       = errors.New("only PDF files are accepted")
	ErrFileTooLarge = errors.New("file exceeds the maximum allowed size")
)

type UploadType string

const (
	UploadTypeCert   UploadType = "cert"
	UploadTypeLetter UploadType = "letter"
	UploadTypePhoto  UploadType = "photo"
)

type UploadService struct {
	uploadDir string
}

func NewUploadService(uploadDir string) *UploadService {
	return &UploadService{uploadDir: uploadDir}
}

// SaveFile validates and stores an uploaded file. Returns the relative path.
func (u *UploadService) SaveFile(file *multipart.FileHeader, uploadType UploadType) (string, error) {
	// Validate MIME type
	if uploadType != UploadTypePhoto {
		if err := validatePDF(file); err != nil {
			return "", err
		}
		// Validate size
		maxSize := int64(MaxCertSizeBytes)
		if uploadType == UploadTypeLetter {
			maxSize = MaxLetterSizeBytes
		}
		if file.Size > maxSize {
			return "", fmt.Errorf("%w: max %dMB", ErrFileTooLarge, maxSize/(1024*1024))
		}
	}

	// Create directory
	dir := filepath.Join(u.uploadDir, string(uploadType))
	if err := os.MkdirAll(dir, 0750); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename
	ext := ".pdf"
	if uploadType == UploadTypePhoto {
		ext = filepath.Ext(file.Filename)
	}
	filename := uuid.New().String() + ext
	destPath := filepath.Join(dir, filename)

	// Open source
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Write destination
	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	// Return relative path for DB storage
	return filepath.Join(string(uploadType), filename), nil
}

// DeleteFile removes a stored file.
func (u *UploadService) DeleteFile(relativePath string) error {
	if relativePath == "" {
		return nil
	}
	fullPath := filepath.Join(u.uploadDir, relativePath)
	return os.Remove(fullPath)
}

func validatePDF(file *multipart.FileHeader) error {
	f, err := file.Open()
	if err != nil {
		return err
	}
	defer f.Close()

	// Read first 4 bytes to check PDF magic number: %PDF
	buf := make([]byte, 4)
	if _, err := f.Read(buf); err != nil {
		return ErrNotPDF
	}
	if string(buf) != "%PDF" {
		return ErrNotPDF
	}
	return nil
}
