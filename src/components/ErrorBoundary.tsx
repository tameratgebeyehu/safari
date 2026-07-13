import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Clipboard } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ errorInfo: info });
    console.error('[CRASH]', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const errorMsg = this.state.error?.message ?? 'Unknown error';
      const errorStack = this.state.error?.stack ?? '';
      const componentStack = this.state.errorInfo?.componentStack ?? '';
      const fullText = `ERROR: ${errorMsg}\n\nSTACK:\n${errorStack}\n\nCOMPONENT:\n${componentStack}`;

      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ App Crashed</Text>
          <Text style={styles.subtitle}>Screenshot this screen and share it for debugging:</Text>
          <ScrollView style={styles.box} contentContainerStyle={{ padding: 12 }}>
            <Text style={styles.errorText}>{fullText}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => {
              try { Clipboard.setString(fullText); } catch {}
            }}
          >
            <Text style={styles.copyText}>📋 Copy Error</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleReset}>
            <Text style={styles.retryText}>↩ Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 12,
  },
  box: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 420,
  },
  errorText: {
    fontSize: 11,
    color: '#FCA5A5',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  copyBtn: {
    backgroundColor: '#27272A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  copyText: {
    color: '#FAFAFA',
    fontWeight: '700',
    fontSize: 14,
  },
  retryBtn: {
    backgroundColor: '#166534',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
