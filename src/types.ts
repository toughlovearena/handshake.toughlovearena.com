export interface HandshakeData {
  type: 'register' | 'signal' | 'error';
  message: string;
}
