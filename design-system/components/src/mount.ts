import type * as ReactNS from 'react';

export function mount(app: ReactNS.ReactElement) {
  const root = document.getElementById('root');
  if (!root) throw new Error("Missing '#root' element to mount the sample page into.");
  window.ReactDOM.createRoot(root).render(app);
}
