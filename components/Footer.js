export default function Footer() {
  return (
    <footer className="border-t bg-background px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Smart Health Monitoring System</p>
        <p className="flex items-center gap-1.5">
          Powered by ESP32 & Firebase
        </p>
      </div>
    </footer>
  );
}
