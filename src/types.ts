export interface HandshakeData {
  type: 'register' | 'ready' | 'signal' | 'error';
  message: string;
}
