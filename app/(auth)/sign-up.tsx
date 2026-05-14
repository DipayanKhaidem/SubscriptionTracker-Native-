import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'
import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import clsx from 'clsx'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [localErrors, setLocalErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const isLoading = fetchStatus === 'fetching'

  const validate = () => {
    const errs: typeof localErrors = {}
    if (!emailAddress.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      errs.email = 'Enter a valid email address'
    }
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match'
    }
    setLocalErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSignUp = async () => {
    if (!validate() || !signUp) return
    const { error } = await signUp.password({ emailAddress, password })
    if (error) return
    await signUp.verifications.sendEmailCode()
  }

  const handleVerify = async () => {
    if (!signUp) return
    await signUp.verifications.verifyEmailCode({ code })
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    }
  }

  if (signUp?.status === 'complete' || isSignedIn) return null

  // OTP verification step
  if (
    signUp?.status === 'missing_requirements' &&
    signUp?.unverifiedFields?.includes('email_address') &&
    (signUp?.missingFields?.length ?? 0) === 0
  ) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">S</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Subtrack</Text>
                    <Text className="auth-wordmark-sub">Smart billing</Text>
                  </View>
                </View>
                <Text className="auth-title">Check your inbox</Text>
                <Text className="auth-subtitle">
                  We sent a 6-digit code to{'\n'}
                  {emailAddress}
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        'auth-input',
                        errors?.fields?.code && 'auth-input-error',
                      )}
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      autoFocus
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx(
                      'auth-button',
                      (isLoading || !code) && 'auth-button-disabled',
                    )}
                    onPress={handleVerify}
                    disabled={isLoading || !code}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp?.verifications.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Wrong email?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable>
                    <Text className="auth-link">Sign in instead</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // Sign-up form
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Subtrack</Text>
                  <Text className="auth-wordmark-sub">Smart billing</Text>
                </View>
              </View>
              <Text className="auth-title">Create account</Text>
              <Text className="auth-subtitle">
                Start tracking every subscription you pay for
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (localErrors.email || errors?.fields?.emailAddress) && 'auth-input-error',
                    )}
                    value={emailAddress}
                    onChangeText={(v) => {
                      setEmailAddress(v)
                      setLocalErrors((p) => ({ ...p, email: undefined }))
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {(localErrors.email || errors?.fields?.emailAddress?.message) && (
                    <Text className="auth-error">
                      {localErrors.email ?? errors?.fields?.emailAddress?.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (localErrors.password || errors?.fields?.password) && 'auth-input-error',
                    )}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v)
                      setLocalErrors((p) => ({ ...p, password: undefined }))
                    }}
                    placeholder="Create a password (min. 8 chars)"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                  />
                  {(localErrors.password || errors?.fields?.password?.message) && (
                    <Text className="auth-error">
                      {localErrors.password ?? errors?.fields?.password?.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      localErrors.confirmPassword && 'auth-input-error',
                    )}
                    value={confirmPassword}
                    onChangeText={(v) => {
                      setConfirmPassword(v)
                      setLocalErrors((p) => ({ ...p, confirmPassword: undefined }))
                    }}
                    placeholder="Re-enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                  />
                  {localErrors.confirmPassword && (
                    <Text className="auth-error">{localErrors.confirmPassword}</Text>
                  )}
                </View>

                <Pressable
                  className={clsx(
                    'auth-button',
                    (isLoading || !emailAddress || !password || !confirmPassword) &&
                      'auth-button-disabled',
                  )}
                  onPress={handleSignUp}
                  disabled={isLoading || !emailAddress || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Get started</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Required for Clerk's bot sign-up protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
