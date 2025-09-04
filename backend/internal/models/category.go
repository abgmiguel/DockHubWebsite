package models

import (
	"regexp"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name" validate:"required"`
	Slug      string             `bson:"slug" json:"slug" validate:"required"`
	Type      string             `bson:"type" json:"type" validate:"required,oneof=blog docs"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

func (c *Category) GenerateSlug() {
	slug := c.Name
	slug = strings.ToLower(slug)
	slug = strings.ReplaceAll(slug, " ", "-")
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")
	c.Slug = slug
}