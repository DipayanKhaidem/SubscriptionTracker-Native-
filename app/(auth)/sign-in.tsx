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
import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import clsx from 'clsx'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({})

  const isLoading = fetchStatus === 'fetching'

  const validate = () => {
    const errs: typeof localErrors = {}
    if (!emailAddress.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      errs.email = 'Enter a valid email address'
    }
    if (!password) errs.password = 'Password is required'
    setLocalErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSignIn = async () => {
    if (!validate() || !signIn) return
    const { error } = await signIn.password({ emailAddress, password })
    if (error) return

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === 'email_code',
      )
      if (emailCodeFactor) await signIn.mfa.sendEmailCode()
    }
  }

  const handleVerify = async () => {
    if (!signIn) return
    await signIn.mfa.verifyEmailCode({ code })
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    }
  }

  // OTP verification step
  if (signIn?.status === 'needs_client_trust') {
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
                  We sent a verification code to{'\n'}
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
                      placeholder="6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      autoFocus
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx('auth-button', (isLoading || !code) && 'auth-button-disabled')}
                    onPress={handleVerify}
                    disabled={isLoading || !code}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-link-row">
                <Pressable onPress={() => signIn.reset()}>
                  <Text className="auth-link">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // Sign-in form
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
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (localErrors.email || errors?.fields?.identifier) && 'auth-input-error',
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
                  {(localErrors.email || errors?.fields?.identifier?.message) && (
                    <Text className="auth-error">
                      {localErrors.email ?? errors?.fields?.identifier?.message}
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
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                  />
                  {(localErrors.password || errors?.fields?.password?.message) && (
                    <Text className="auth-error">
                      {localErrors.password ?? errors?.fields?.password?.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={clsx(
                    'auth-button',
                    (isLoading || !emailAddress || !password) && 'auth-button-disabled',
                  )}
                  onPress={handleSignIn}
                  disabled={isLoading || !emailAddress || !password}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Subtrack?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
