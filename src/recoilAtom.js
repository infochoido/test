import { atom } from 'recoil';

export const userProfileState = atom({
    key: 'userProfileState',
    default: {
      name: '',
      nickname: '',
      email: '',
      profilePicture: '',
    },
});
