export default function useTitle(title: string) {
  if (!title) {
    return;
  }
  document.title = title;
}
