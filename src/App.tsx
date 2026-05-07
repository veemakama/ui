/**
 * App.tsx — root shell
 * Replace this with the dashboard layout once components are built.
 */
function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-canvas)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-family-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "var(--spacing-md)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-heading-2)",
          fontWeight: 600,
          letterSpacing: "var(--letter-spacing-heading-2)",
        }}
      >
        sorokit-ui
      </h1>
      <p
        style={{
          fontSize: "var(--font-size-body-sm)",
          color: "var(--color-steel)",
        }}
      >
        Stellar UI kit — powered by sorokit-core
      </p>
      <span
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-on-primary)",
          fontSize: "var(--font-size-caption)",
          fontWeight: 600,
          borderRadius: "var(--rounded-full)",
          padding: "4px 10px",
        }}
      >
        theme active
      </span>
    </div>
  );
}

export default App;
