package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var (
	jwtSecretKey        = []byte("your_jwt_secret_key")         // Replace with your secret
	jwtRefreshSecretKey = []byte("your_jwt_refresh_secret_key") // Replace with your refresh secret
	jwtExpiryDuration   = time.Minute * 15
	jwtRefreshDuration  = time.Hour * 24 * 7
)

type JWTPayload struct {
	UserID uint
}

type JWTTokenPair struct {
	JWTToken        string
	RefreshJWTToken string
}

func GenerateJWTTokenPair(payload JWTPayload) (*JWTTokenPair, error) {
	// JWT Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": payload.UserID,
		"exp":     time.Now().Add(jwtExpiryDuration).Unix(),
	})
	jwtToken, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return nil, err
	}

	// Refresh Token
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": payload.UserID,
		"exp":     time.Now().Add(jwtRefreshDuration).Unix(),
		"type":    "refresh",
	})
	refreshJWTToken, err := refreshToken.SignedString(jwtRefreshSecretKey)
	if err != nil {
		return nil, err
	}

	return &JWTTokenPair{
		JWTToken:        jwtToken,
		RefreshJWTToken: refreshJWTToken,
	}, nil
}

func ParseJWTToken(tokenString string) (*JWTPayload, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the alg is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecretKey, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("user_id not found in token")
	}

	return &JWTPayload{
		UserID: uint(userIDFloat),
	}, nil
}

func ParseRefreshJWTToken(tokenString string) (*JWTPayload, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the alg is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtRefreshSecretKey, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	// Optionally check the "type" field
	if t, ok := claims["type"].(string); !ok || t != "refresh" {
		return nil, errors.New("not a refresh token")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("user_id not found in refresh token")
	}

	return &JWTPayload{
		UserID: uint(userIDFloat),
	}, nil
}
