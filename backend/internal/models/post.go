package models

import (
	"math"
	"regexp"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	Title       string              `bson:"title" json:"title" validate:"required"`
	Slug        string              `bson:"slug" json:"slug" validate:"required"`
	Content     string              `bson:"content" json:"content" validate:"required"`
	Description string              `bson:"description" json:"description" validate:"required"`
	Type        string              `bson:"type" json:"type" validate:"required,oneof=blog docs"`
	Author      primitive.ObjectID  `bson:"author" json:"author"`
	Category    primitive.ObjectID  `bson:"category" json:"category"`
	CoverImage  string              `bson:"coverImage,omitempty" json:"coverImage,omitempty"`
	ReadingTime int                 `bson:"readingTime" json:"readingTime"`
	Order       int                 `bson:"order,omitempty" json:"order,omitempty"`
	ParentDoc   *primitive.ObjectID `bson:"parentDoc,omitempty" json:"parentDoc,omitempty"`
	Published   bool                `bson:"published" json:"published"`
	CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time           `bson:"updatedAt" json:"updatedAt"`
}

type PostWithAuthor struct {
	Post
	AuthorData   *User     `json:"author_data,omitempty"`
	CategoryData *Category `json:"category_data,omitempty"`
}

func (p *Post) GenerateSlug() {
	// Convert to lowercase
	slug := strings.ToLower(p.Title)
	
	// Replace any non-alphanumeric characters (except spaces) with spaces
	reg := regexp.MustCompile("[^a-z0-9\\s]+")
	slug = reg.ReplaceAllString(slug, " ")
	
	// Replace multiple spaces with single space
	slug = regexp.MustCompile("\\s+").ReplaceAllString(slug, " ")
	
	// Trim spaces
	slug = strings.TrimSpace(slug)
	
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	
	// Remove multiple hyphens
	slug = regexp.MustCompile("-+").ReplaceAllString(slug, "-")
	
	// Remove leading/trailing hyphens
	slug = strings.Trim(slug, "-")
	
	// If slug is empty, generate from timestamp
	if slug == "" {
		slug = "post-" + time.Now().Format("20060102150405")
	}
	
	p.Slug = slug
}

func (p *Post) CalculateReadingTime() {
	// Estimate ~200 words per minute
	words := len(strings.Fields(p.Content))
	p.ReadingTime = int(math.Ceil(float64(words) / 200.0))
}