import { atom } from 'recoil';

export const nameState = atom({
  key: 'nameState',
  default: '', // Set the default value
});

export const nicknameState = atom({
  key: 'nicknameState',
  default: '', // Set the default value
});