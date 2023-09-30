package dto

import "github.com/dgrijalva/jwt-go"

type JwtReq struct {
	ID   string `json:"id"`
	Role string `json:"role"`
}
type JwtClaim struct {
	*jwt.StandardClaims
	// Username     string `json:"username"`
	//RefreshToken string `json:"refresh_token"`
	ID   string `json:"id"`
	Role string `json:"role"`
	// Email        string `json:"email"`
	// Phone        string `json:"phone"`
}
type JwtConfig struct {
	jwt.StandardClaims
	SigningMethod string `json:"signing_method"`
	PublicKey     string `json:"public_key"`
	PrivateKey    string `json:"private_key"`
}
