package usecase

import (
	"Trip-Service/config"
	"Trip-Service/internal/common"
	"Trip-Service/internal/dto"
	"context"
	"crypto/rsa"
	"encoding/base64"
	"time"

	"github.com/google/uuid"

	"github.com/dgrijalva/jwt-go"
)

type JwtUsecase interface {
	GenerateAccessToken(ctx context.Context, req dto.JwtReq) (string, *dto.JwtClaim, error)
	GenerateRefreshToken(ctx context.Context, req dto.JwtReq) (string, *dto.JwtClaim, error)
	VerifyToken(ctx context.Context, tokenStr string) (dto.JwtClaim, error)
}

type jwtUsecase struct {
	cfg        *config.Config
	publicKey  *rsa.PublicKey
	privateKey *rsa.PrivateKey
	signMethod jwt.SigningMethod
}

func NewJwtUsecase(
	cfg *config.Config,
	pri *rsa.PrivateKey,
	pub *rsa.PublicKey,
	sign jwt.SigningMethod,
) JwtUsecase {
	return &jwtUsecase{
		cfg:        cfg,
		publicKey:  pub,
		privateKey: pri,
		signMethod: sign,
	}
}

func ParseKey(cfg *config.Config) (*rsa.PrivateKey, *rsa.PublicKey, jwt.SigningMethod, error) {
	var (
		private *rsa.PrivateKey
		public  *rsa.PublicKey
		sign    jwt.SigningMethod
		err     error
	)

	// base64.StdEncoding.DecodeString(cfg.JWT.PrivateKey)
	privateByte, err := base64.StdEncoding.DecodeString(cfg.Jwt.PrivateKey)
	if err != nil {
		return private, public, sign, err
	}
	private, err = jwt.ParseRSAPrivateKeyFromPEM(privateByte)
	if err != nil {
		return private, public, sign, err
	}
	publicByte, err := base64.StdEncoding.DecodeString(cfg.Jwt.PublicKey)
	if err != nil {
		return private, public, sign, err
	}
	public, err = jwt.ParseRSAPublicKeyFromPEM(publicByte)
	if err != nil {
		return private, public, sign, err
	}
	return private, public, jwt.GetSigningMethod(cfg.Jwt.SigningMethod), err
}

func (j *jwtUsecase) GenerateAccessToken(ctx context.Context, req dto.JwtReq) (string, *dto.JwtClaim, error) {
	var (
		tokenStr string
		err      error
	)
	jwtToken := jwt.New(j.signMethod)
	jwtClaim := dto.JwtClaim{
		ID:   req.ID,
		Role: req.Role,
		StandardClaims: &jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Second * time.Duration(j.cfg.Jwt.ShortTokenExpireTime)).Unix(),
			Issuer:    j.cfg.Jwt.Issuer,
		},
	}
	jwtToken.Claims = jwtClaim
	tokenStr, err = jwtToken.SignedString(j.privateKey)
	if err != nil {
		return tokenStr, nil, err
	}
	return tokenStr, &jwtClaim, nil
}

func (j *jwtUsecase) GenerateRefreshToken(ctx context.Context, req dto.JwtReq) (string, *dto.JwtClaim, error) {
	var (
		tokenStr string
		err      error
	)
	jwtToken := jwt.New(j.signMethod)
	jwtClaim := dto.JwtClaim{
		ID:   req.ID,
		Role: req.Role,
		StandardClaims: &jwt.StandardClaims{
			Id:        uuid.New().String(),
			ExpiresAt: time.Now().Add(time.Second * time.Duration(j.cfg.Jwt.RefreshTokenExpireTime)).Unix(),
			Issuer:    j.cfg.Jwt.Issuer,
		},
	}
	jwtToken.Claims = jwtClaim
	tokenStr, err = jwtToken.SignedString(j.privateKey)
	if err != nil {
		return tokenStr, nil, err
	}
	return tokenStr, &jwtClaim, nil
}

func (j *jwtUsecase) VerifyToken(ctx context.Context, tokenStr string) (dto.JwtClaim, error) {
	var (
		claims dto.JwtClaim
		err    error
	)
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		return j.publicKey, nil
	}
	token, err := jwt.ParseWithClaims(tokenStr, &claims, keyFunc)

	jwtErr, _ := err.(*jwt.ValidationError)
	if jwtErr != nil && jwtErr.Errors == jwt.ValidationErrorExpired {
		return claims, common.ErrTokenExpired
	}
	if err != nil || !token.Valid {
		return claims, common.ErrTokenInvalid
	}
	return claims, nil
}
