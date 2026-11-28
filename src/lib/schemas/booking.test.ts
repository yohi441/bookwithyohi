import { describe, expect, it } from "vitest";
import { bookingSchema } from "./booking";

const validInput = {
  slug: "intro-chat",
  guestName: "  Jane Doe  ",
  guestEmail: "jane@example.com",
  startUtc: "2026-11-30T01:00:00.000Z",
};

describe("bookingSchema", () => {
  it("accepts a complete booking request and trims the name", () => {
    expect(bookingSchema.parse(validInput)).toEqual({ ...validInput, guestName: "Jane Doe" });
  });

  it("rejects a bad email", () => {
    expect(bookingSchema.safeParse({ ...validInput, guestEmail: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("rejects a missing selected slot", () => {
    expect(bookingSchema.safeParse({ ...validInput, startUtc: "" }).success).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(bookingSchema.safeParse({ ...validInput, guestName: " " }).success).toBe(false);
  });
});
