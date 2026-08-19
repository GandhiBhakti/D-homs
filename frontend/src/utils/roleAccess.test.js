import {
  canAccessRoute,
  getHomeRoute,
  isReceptionistLimited,
} from "./roleAccess";

describe("role access helpers", () => {
  it("lets admin access all routes", () => {
    expect(canAccessRoute("admin", ["admin", "doctor", "receptionist"])).toBe(
      true,
    );
    expect(canAccessRoute("admin", ["admin"])).toBe(true);
  });

  it("allows doctors to access doctor and patient workflows", () => {
    expect(canAccessRoute("doctor", ["admin", "doctor"])).toBe(true);
    expect(canAccessRoute("doctor", ["receptionist"])).toBe(false);
  });

  it("keeps receptionists limited to OPD and IPD workflows", () => {
    expect(
      canAccessRoute("receptionist", ["admin", "doctor", "receptionist"]),
    ).toBe(true);
    expect(canAccessRoute("receptionist", ["admin"])).toBe(false);
    expect(isReceptionistLimited("receptionist")).toBe(true);
    expect(getHomeRoute("receptionist")).toBe("/opd/registration");
  });
});
