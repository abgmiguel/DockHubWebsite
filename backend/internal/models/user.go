package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name" validate:"required"`
	Email     string             `bson:"email" json:"email" validate:"required,email"`
	Password  string             `bson:"password" json:"-"`
	Role      string             `bson:"role" json:"role" validate:"required,oneof=admin user"`
	Approved  bool               `bson:"approved" json:"approved"`
	Social    *SocialCredentials `bson:"social,omitempty" json:"social,omitempty"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type SocialCredentials struct {
	Reddit   *RedditCredentials   `bson:"reddit,omitempty" json:"reddit,omitempty"`
	Devto    *DevtoCredentials    `bson:"devto,omitempty" json:"devto,omitempty"`
	LinkedIn *LinkedInCredentials `bson:"linkedin,omitempty" json:"linkedin,omitempty"`
	Facebook *FacebookCredentials `bson:"facebook,omitempty" json:"facebook,omitempty"`
	Twitter  *TwitterCredentials  `bson:"twitter,omitempty" json:"twitter,omitempty"`
}

type RedditCredentials struct {
	ClientID     string `bson:"client_id" json:"client_id"`
	ClientSecret string `bson:"client_secret" json:"client_secret"`
	Username     string `bson:"username" json:"username"`
	Password     string `bson:"password" json:"password"`
	Subreddits   string `bson:"subreddits" json:"subreddits"`
}

type DevtoCredentials struct {
	APIKey string `bson:"api_key" json:"api_key"`
}

type LinkedInCredentials struct {
	AccessToken string `bson:"access_token" json:"access_token"`
}

type FacebookCredentials struct {
	PageID          string `bson:"page_id" json:"page_id"`
	PageAccessToken string `bson:"page_access_token" json:"page_access_token"`
}

type TwitterCredentials struct {
	APIKey            string `bson:"api_key" json:"api_key"`
	APISecret         string `bson:"api_secret" json:"api_secret"`
	AccessToken       string `bson:"access_token" json:"access_token"`
	AccessTokenSecret string `bson:"access_token_secret" json:"access_token_secret"`
}

func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) ComparePassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}