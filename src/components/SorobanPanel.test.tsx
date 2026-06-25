import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SorobanPanel } from "./SorobanPanel";
import { useSorokit } from "@/context/useSorokit";

// Mock the useSorokit context
vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

// Mock the getClient from lib/client
vi.mock("../lib/client", () => ({
  getClient: () => ({
    soroban: {
      invokeContract: vi.fn().mockResolvedValue({ data: "Success", error: null }),
    },
  }),
}));

describe("SorobanPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: true,
      address: "GABC",
    } as any);
  });

  it("should have invoke button disabled when method is empty", () => {
    render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });
    expect(invokeBtn).toBeDisabled();
  });

  it("should show error when invalid JSON args are provided", async () => {
    let currentContractId = "";
    const setContractId = (id: string) => {
      currentContractId = id;
    };

    const { rerender } = render(
      <SorobanPanel contractId={currentContractId} onContractIdChange={setContractId} />
    );
    
    // Fill out contract ID and method to enable the button
    const contractInput = screen.getByPlaceholderText(/c\.\.\./i);
    const methodInput = screen.getByPlaceholderText(/transfer/i);
    const argsInput = screen.getByPlaceholderText(/\[.*\]/i);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(contractInput, { target: { value: "C123" } });
    fireEvent.change(methodInput, { target: { value: "mint" } });
    fireEvent.change(argsInput, { target: { value: "invalid json {" } });

    // Rerender with the updated contract ID to propagate prop change
    rerender(<SorobanPanel contractId="C123" onContractIdChange={setContractId} />);

    expect(invokeBtn).not.toBeDisabled();
    
    fireEvent.click(invokeBtn);

    // Expect the error state to be set
    const errorText = await screen.findByText(/Invalid JSON in arguments/i);
    expect(errorText).toBeInTheDocument();
  });

  // ── Non-array JSON args (#118) ────────────────────────────────────────────
  // Valid JSON that is not an array (e.g. `{}` or `42`) must be rejected before
  // it is forwarded to invokeContract, which expects an argument array.
  async function invokeWithArgs(argsValue: string) {
    const { rerender } = render(
      <SorobanPanel contractId="" onContractIdChange={() => {}} />,
    );
    fireEvent.change(screen.getByPlaceholderText(/c\.\.\./i), {
      target: { value: "C123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/transfer/i), {
      target: { value: "mint" },
    });
    fireEvent.change(screen.getByPlaceholderText(/\[.*\]/i), {
      target: { value: argsValue },
    });
    rerender(<SorobanPanel contractId="C123" onContractIdChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /invoke/i }));
  }

  it("rejects a JSON object (non-array) with a 'must be a JSON array' error", async () => {
    await invokeWithArgs("{}");
    expect(
      await screen.findByText(/Arguments must be a JSON array/i),
    ).toBeInTheDocument();
  });

  it("rejects a JSON number (non-array) with a 'must be a JSON array' error", async () => {
    await invokeWithArgs("42");
    expect(
      await screen.findByText(/Arguments must be a JSON array/i),
    ).toBeInTheDocument();
  });

  it("accepts a valid JSON array and reaches the success state", async () => {
    await invokeWithArgs('["arg1", 42]');
    // No validation error; the mocked invokeContract resolves successfully.
    expect(
      screen.queryByText(/Arguments must be a JSON array/i),
    ).not.toBeInTheDocument();
    expect(await screen.findByText(/success/i)).toBeInTheDocument();
  });
});
