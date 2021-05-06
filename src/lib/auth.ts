import { Magic } from 'magic-sdk';
import { writable }  from 'svelte/store';
import { goto } from '$app/navigation';

let magic;

export const store = writable({
  state: null,
  user: null
});

function createMagic() {
  return magic || new Magic(import.meta.env.VITE_MAGIC_PUBLIC_KEY as string);
}

export function init(): void {
  store.update(prev => {
    return Object.assign({}, prev, { state: 'loading' });
  });
  authenticate();
}

export async function login(email: string): Promise<void> {
  const magic = createMagic();

  const didToken = await magic.auth.loginWithMagicLink({ email });

  // Validate the did token on the server
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${didToken}`
    }
  });

  if (res.ok) {
    const data = await res.json();
    store.set({
      state: null,
      user: data.user
    });
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout');
  store.set({
    state: null,
    user: null
  });
  goto('/auth');
}

async function authenticate(): Promise<void> {
  try {
    const res = await fetch('/api/auth/user');
    const { user } = await res.json();
    store.set({
      state: null,
      user
    });
  } catch (err) {
    console.log(err);
  }
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     store.update(prev => Object.assign({}, prev, {
  //       state: 'unauthorized',
  //       user: null
  //     }));
  //     resolve();
  //   }, 1000);
  // });
}