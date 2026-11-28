import { describe, expect, it } from "vitest";
import { generateSlots, type Slot } from "./slots";

const MANILA = "Asia/Manila";
const NEW_YORK = "America/New_York";

function starts(slots: Slot[]): string[] {
  return slots.map((slot) => slot.startUtc.toISOString());
}

const mondayMorning = { dayOfWeek: 1, startMinute: 540, endMinute: 660 };

describe("generateSlots", () => {
  it("generates every whole slot inside a weekly window", () => {
    const slots = generateSlots({
      weekly: [mondayMorning],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
    });

    expect(starts(slots)).toEqual([
      "2026-11-30T01:00:00.000Z",
      "2026-11-30T01:30:00.000Z",
      "2026-11-30T02:00:00.000Z",
      "2026-11-30T02:30:00.000Z",
    ]);
    expect(slots[0].endUtc.toISOString()).toBe("2026-11-30T01:30:00.000Z");
  });

  it("supports multiple windows per day and ignores other weekdays", () => {
    const slots = generateSlots({
      weekly: [
        { dayOfWeek: 1, startMinute: 540, endMinute: 600 },
        { dayOfWeek: 1, startMinute: 780, endMinute: 840 },
        { dayOfWeek: 2, startMinute: 540, endMinute: 600 },
      ],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-12-01" },
    });

    expect(starts(slots)).toEqual([
      "2026-11-30T01:00:00.000Z",
      "2026-11-30T01:30:00.000Z",
      "2026-11-30T05:00:00.000Z",
      "2026-11-30T05:30:00.000Z",
      "2026-12-01T01:00:00.000Z",
      "2026-12-01T01:30:00.000Z",
    ]);
  });

  it("treats a blank exception as a day off", () => {
    const slots = generateSlots({
      weekly: [mondayMorning, { dayOfWeek: 2, startMinute: 540, endMinute: 600 }],
      exceptions: [{ date: "2026-11-30", startMinute: null, endMinute: null }],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-12-01" },
    });

    expect(starts(slots)).toEqual(["2026-12-01T01:00:00.000Z", "2026-12-01T01:30:00.000Z"]);
  });

  it("lets a timed exception override the weekly window", () => {
    const slots = generateSlots({
      weekly: [mondayMorning],
      exceptions: [{ date: "2026-11-30", startMinute: 600, endMinute: 720 }],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
    });

    expect(starts(slots)).toEqual([
      "2026-11-30T02:00:00.000Z",
      "2026-11-30T02:30:00.000Z",
      "2026-11-30T03:00:00.000Z",
      "2026-11-30T03:30:00.000Z",
    ]);
  });

  it("removes slots that overlap an existing booking", () => {
    const slots = generateSlots({
      weekly: [mondayMorning],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
      bookings: [{ startUtc: "2026-11-30T01:30:00.000Z", endUtc: "2026-11-30T02:00:00.000Z" }],
    });

    expect(starts(slots)).toEqual([
      "2026-11-30T01:00:00.000Z",
      "2026-11-30T02:00:00.000Z",
      "2026-11-30T02:30:00.000Z",
    ]);
  });

  it("applies a buffer around existing bookings", () => {
    const input = {
      weekly: [mondayMorning],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
      bookings: [
        {
          startUtc: new Date("2026-11-30T01:30:00.000Z"),
          endUtc: new Date("2026-11-30T02:00:00.000Z"),
        },
      ],
    };

    expect(starts(generateSlots({ ...input, bufferMinutes: 15 }))).toEqual([
      "2026-11-30T02:30:00.000Z",
    ]);
  });

  it("returns nothing when every slot is booked", () => {
    const slots = generateSlots({
      weekly: [mondayMorning],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
      bookings: [{ startUtc: "2026-11-30T01:00:00.000Z", endUtc: "2026-11-30T03:00:00.000Z" }],
    });

    expect(slots).toEqual([]);
  });

  it("skips local times erased by a spring-forward DST jump", () => {
    const slots = generateSlots({
      weekly: [{ dayOfWeek: 0, startMinute: 60, endMinute: 240 }],
      durationMinutes: 60,
      timeZone: NEW_YORK,
      range: { startDate: "2026-03-08", endDate: "2026-03-08" },
    });

    expect(starts(slots)).toEqual(["2026-03-08T06:00:00.000Z", "2026-03-08T07:00:00.000Z"]);
  });

  it("resolves repeated fall-back times deterministically", () => {
    const slots = generateSlots({
      weekly: [{ dayOfWeek: 0, startMinute: 0, endMinute: 240 }],
      durationMinutes: 60,
      timeZone: NEW_YORK,
      range: { startDate: "2026-11-01", endDate: "2026-11-01" },
    });

    expect(starts(slots)).toEqual([
      "2026-11-01T04:00:00.000Z",
      "2026-11-01T06:00:00.000Z",
      "2026-11-01T07:00:00.000Z",
      "2026-11-01T08:00:00.000Z",
    ]);
  });

  it("uses the correct UTC offset on each side of a DST change", () => {
    const slots = generateSlots({
      weekly: [{ dayOfWeek: 0, startMinute: 540, endMinute: 600 }],
      durationMinutes: 60,
      timeZone: NEW_YORK,
      range: { startDate: "2026-03-01", endDate: "2026-03-08" },
    });

    expect(starts(slots)).toEqual(["2026-03-01T14:00:00.000Z", "2026-03-08T13:00:00.000Z"]);
  });

  it("rejects invalid inputs", () => {
    const base = {
      weekly: [mondayMorning],
      durationMinutes: 30,
      timeZone: MANILA,
      range: { startDate: "2026-11-30", endDate: "2026-11-30" },
    };

    expect(() => generateSlots({ ...base, durationMinutes: 0 })).toThrow(RangeError);
    expect(() => generateSlots({ ...base, durationMinutes: 2.5 })).toThrow(RangeError);
    expect(() => generateSlots({ ...base, bufferMinutes: -1 })).toThrow(RangeError);
    expect(() =>
      generateSlots({ ...base, range: { startDate: "2026-12-01", endDate: "2026-11-30" } }),
    ).toThrow(RangeError);
    expect(() =>
      generateSlots({ ...base, range: { startDate: "2026-02-30", endDate: "2026-02-30" } }),
    ).toThrow(RangeError);
    expect(() =>
      generateSlots({ ...base, bookings: [{ startUtc: "not-a-date", endUtc: "also-bad" }] }),
    ).toThrow(RangeError);
    expect(() => generateSlots({ ...base, timeZone: "Not/AZone" })).toThrow();
  });
});
