package logger

import (
	"Trip-Service/config"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var loggerLevelMap = map[string]zapcore.Level{
	"debug":  zapcore.DebugLevel,
	"info":   zapcore.InfoLevel,
	"warn":   zapcore.WarnLevel,
	"error":  zapcore.ErrorLevel,
	"dpanic": zapcore.DPanicLevel,
	"panic":  zapcore.PanicLevel,
	"fatal":  zapcore.FatalLevel,
}

type ILogger interface {
	Debug(args ...interface{})
	Debugf(template string, args ...interface{})
	Info(args ...interface{})
	Infof(template string, args ...interface{})
	Warn(args ...interface{})
	Warnf(template string, args ...interface{})
	Error(args ...interface{})
	Errorf(template string, args ...interface{})
	DPanic(args ...interface{})
	DPanicf(template string, args ...interface{})
	Fatal(args ...interface{})
	Fatalf(template string, args ...interface{})
}

type logger struct {
	sugarLogger *zap.SugaredLogger
	logger      *zap.Logger
	key         string
	zapSugar    bool
}

var Log *logger = &logger{}

func configure(isFile bool) zapcore.WriteSyncer {
	if !isFile {
		writers := []zapcore.WriteSyncer{os.Stdout}
		return zapcore.NewMultiWriteSyncer(writers...)
	}
	pathFolderLog := "logs"
	fmt.Println(runtime.GOOS)
	if strings.Contains(runtime.GOOS, "linux") {
		pathFolderLog = pathFolderLog + "/"

	} else if strings.Contains(runtime.GOOS, "darwin") {
		pathFolderLog = pathFolderLog + "/"

	} else {
		pathFolderLog = pathFolderLog + "\\"
	}

	fileName := pathFolderLog + "logger.log"
	w := zapcore.AddSync(&lumberjack.Logger{
		Filename:   fileName,
		MaxSize:    3, // megabytes
		MaxBackups: 300,
		MaxAge:     100, // days
	})

	return zapcore.NewMultiWriteSyncer(
		zapcore.AddSync(os.Stdout),
		// zapcore.AddSync(os.Stderr),
		zapcore.AddSync(w),
	)
}

func GetLogger() *logger {
	if Log == nil {
		// TODO logging
		Newlogger(config.Logger{})
	}
	return Log
}

// App Logger constructor
func Newlogger(cfg config.Logger) ILogger {
	logLevel, exist := loggerLevelMap[cfg.Level]
	if !exist {
		logLevel = zapcore.DebugLevel
	}

	var encoderCfg zapcore.EncoderConfig
	if cfg.Mode == "pro" {
		encoderCfg = zap.NewProductionEncoderConfig()
	} else {
		encoderCfg = zap.NewDevelopmentEncoderConfig()

	}
	encoderCfg.LevelKey = "LEVEL"
	encoderCfg.CallerKey = "CALLER"
	encoderCfg.TimeKey = "TIME"
	encoderCfg.NameKey = "NAME"
	encoderCfg.MessageKey = "MESSAGE"
	encoderCfg.EncodeDuration = zapcore.NanosDurationEncoder
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCfg.FunctionKey = "FUNC"
	var encoder zapcore.Encoder
	if cfg.Encoding == "console" {
		encoder = zapcore.NewConsoleEncoder(encoderCfg)
	} else {
		encoder = zapcore.NewJSONEncoder(encoderCfg)
	}

	core := zapcore.NewCore(encoder, configure(cfg.LogFile), zap.NewAtomicLevelAt(logLevel))
	loggerzap := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(0))
	sugarLogger := loggerzap.Sugar()

	logging := &logger{
		sugarLogger: sugarLogger,
		logger:      loggerzap,
		key:         uuid.NewString(),
		zapSugar:    strings.Contains(cfg.ZapType, "sugar"),
	}

	Log = logging
	return logging
}

func (l *logger) SetLogginID(key string) {
	l.key = key
}

func (l *logger) Debug(args ...interface{}) {
	if l.zapSugar {
		l.sugarLogger.Debug(args...)
		return
	}
	str := fmt.Sprintf("%s", args...)
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Debug(str, fields...)
}

func (l *logger) Debugf(template string, args ...interface{}) {
	if l.zapSugar {
		str := fmt.Sprintf("UUID:%s, %s", l.key, template)
		l.sugarLogger.Debugf(str, args...)
		return
	}
	str := fmt.Sprintf("%s", args...)
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Debug(str, fields...)
}

func (l *logger) Info(args ...interface{}) {
	if l.zapSugar {
		l.sugarLogger.Info(args...)
		return
	}
	str := fmt.Sprintf("%s", args...)
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Info(str, fields...)
}

func (l *logger) Infof(template string, args ...interface{}) {
	if l.zapSugar {
		str := fmt.Sprintf("UUID:%s, %s", l.key, template)
		l.sugarLogger.Infof(str, args...)
		return
	}
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Info(fmt.Sprintf(template, args...), fields...)
}

func (l *logger) Warn(args ...interface{}) {
	if l.zapSugar {
		l.sugarLogger.Warn(args...)
		return
	}
	str := fmt.Sprintf("%s", args...)
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Warn(str, fields...)
	// l.sugarLogger.Warn(args...)
}

func (l *logger) Warnf(template string, args ...interface{}) {

	if l.zapSugar {
		str := fmt.Sprintf("UUID:%s, %s", l.key, template)
		l.sugarLogger.Warnf(str, args...)
		return
	}
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Warn(fmt.Sprintf(template, args...), fields...)
	// l.sugarLogger.Warnf(template, args...)
}

func (l *logger) Error(args ...interface{}) {
	if l.zapSugar {
		l.sugarLogger.Error(args...)
		return
	}
	str := fmt.Sprintf("%s", args...)
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Error(str, fields...)
}

func (l *logger) Errorf(template string, args ...interface{}) {
	if l.zapSugar {
		str := fmt.Sprintf("UUID:%s, %s", l.key, template)
		l.sugarLogger.Errorf(str, args...)
		return
	}
	fields := []zapcore.Field{
		zap.String("UUID", l.key),
	}
	l.logger.Error(fmt.Sprintf(template, args...), fields...)
}

func (l *logger) DPanic(args ...interface{}) {
	l.sugarLogger.DPanic(args...)
}

func (l *logger) DPanicf(template string, args ...interface{}) {
	l.sugarLogger.DPanicf(template, args...)
}

func (l *logger) Panic(args ...interface{}) {
	l.sugarLogger.Panic(args...)
}

func (l *logger) Panicf(template string, args ...interface{}) {
	l.sugarLogger.Panicf(template, args...)
}

func (l *logger) Fatal(args ...interface{}) {
	l.sugarLogger.Fatal(args...)
}

func (l *logger) Fatalf(template string, args ...interface{}) {
	l.sugarLogger.Fatalf(template, args...)
}
