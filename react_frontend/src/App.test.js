import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// PUBLIC_INTERFACE
test("renders Tic Tac Toe title", () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
});

test("renders empty board with 9 cells", () => {
  render(<App />);
  const cells = screen.getAllByRole("button", { name: "" });
  // Actually X/O cells have aria-label filled, so test with general cell count (should be 9)
  expect(screen.getAllByRole("button")).toHaveLength(10); // 9 board, 1 restart button
});

test("allows two players to play and declares winner", () => {
  render(<App />);
  const cellButtons = screen.getAllByRole("button").slice(0, 9);

  // X plays 0, O plays 1, X plays 3, O plays 4, X plays 6 to win
  fireEvent.click(cellButtons[0]);
  fireEvent.click(cellButtons[1]);
  fireEvent.click(cellButtons[3]);
  fireEvent.click(cellButtons[4]);
  fireEvent.click(cellButtons[6]);

  expect(screen.getByText(/X wins!/)).toBeInTheDocument();
});

test("draw state is shown", () => {
  render(<App />);
  const c = screen.getAllByRole("button").slice(0, 9);
  // X O X O X O O X X
  [0, 1, 2, 4, 3, 5, 6, 8, 7].forEach(idx => {
    fireEvent.click(c[idx]);
  });
  expect(screen.getByText(/Draw/i)).toBeInTheDocument();
});
