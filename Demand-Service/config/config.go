package config

import (
	"github.com/spf13/viper"
)

var yamlConfig = []byte(``)

type (
	// Config of service
	Config struct {
		Mongo           Mongo    `yaml:"mongo" mapstructure:"mongo"`
		Logger          Logger   `yaml:"logger" mapstructure:"logger"`
		CORSLocal       bool     `yaml:"cors_local" mapstructure:"cors_local"`
		DbMigrationdata bool     `yaml:"db_migration_data" mapstructure:"db_migration_data"`
		HTTPAddress     int      `yaml:"http_address" mapstructure:"http_address"`
		OrderGrpcPort   int      `yaml:"order_grpc_port" mapstructure:"order_grpc_port"`
		ChatGrpcPort    int      `yaml:"chat_grpc_port" mapstructure:"chat_grpc_port"`
		AuthGrpcPort    int      `yaml:"auth_grpc_port" mapstructure:"auth_grpc_port"`
		DeliveryUrl     string   `yaml:"delivery_url" mapstructure:"delivery_url"`
		ServiceName     string   `yaml:"service_name" mapstructure:"service_name"`
		Domains         []string `yaml:"domains" mapstructure:"domains"`
		Jwt             Jwt      `yaml:"jwt" mapstructure:"jwt"`
		Kafka           Kafka    `yaml:"kafka" mapstructure:"kafka"`
	}

	Logger struct {
		Mode              string `yaml:"mode" mapstructure:"mode"`
		DisableCaller     bool   `yaml:"disable_caller" mapstructure:"disable_caller"`
		DisableStacktrace bool   `yaml:"disable_stacktrace" mapstructure:"disable_stacktrace"`
		LogFile           bool   `yaml:"log_file" mapstructure:"log_file"`
		Payload           bool   `yaml:"payload" mapstructure:"payload"`
		Encoding          string `yaml:"encoding" mapstructure:"encoding"`
		Level             string `yaml:"level" mapstructure:"level"`
		ZapType           string `yaml:"zap_type" mapstructure:"zap_type"`
	}

	Mongo struct {
		Url string `yaml:"url" mapstructure:"url"`
	}

	Jwt struct {
		SigningMethod          string `yaml:"signing_method" mapstructure:"signing_method"`
		PrivateKey             string `yaml:"private_key" mapstructure:"private_key"`
		PublicKey              string `yaml:"public_key" mapstructure:"public_key"`
		Issuer                 string `yaml:"issuer" mapstructure:"issuer"`
		RefreshTokenExpireTime uint   `yaml:"refresh_token_expire" mapstructure:"refresh_token_expire"`
		LongTokenExpireTime    uint   `yaml:"long_token_expire" mapstructure:"long_token_expire"`
		ShortTokenExpireTime   uint   `yaml:"short_token_expire" mapstructure:"short_token_expire"`
		IsRefreshToken         bool   `yaml:"is_refresh_token" mapstructure:"is_refresh_token"`
		ValidatePassword       bool   `yaml:"validate_password" mapstructure:"validate_password"`
	}

	// Kafka config
	Kafka struct {
		Server         string `yaml:"server" mapstructure:"server"`
		AuditLogServer string
		Username       string
		Password       string
	}
)

// LoadConfig is func load config for app
func LoadConfig() (*Config, error) {
	cfg := &Config{}
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		return cfg, err
	}
	err = viper.Unmarshal(&cfg)
	if err != nil {
		return cfg, err
	}
	return cfg, err
}
