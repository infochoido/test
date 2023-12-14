// recoilPersist.js
import { atom, RecoilState, useRecoilState } from 'recoil';

export const persistAtom = (atom, key) => {
  const persistedAtom = atom({
    ...atom,
    default: localStorage.getItem(key),
    effects_UNSTABLE: [
      ({ onSet }) => {
        onSet((newValue) => {
          localStorage.setItem(key, JSON.stringify(newValue));
        });
      },
    ],
  });

  return persistedAtom;
};

export const usePersistedRecoilState = (atom, key) => {
  const persistedAtom = persistAtom(atom, key);
  return useRecoilState(persistedAtom);
};
