import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Field, Input } from "./components/ui";
import { copy } from "./context";
import { entrepreneurNavigation, staffNavigation } from "./portalNavigation";

const leafPaths = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return item && typeof item === "object" ? leafPaths(item, path) : [path];
  });

describe("accessible fields", () => {
  it("renders registration documents instead of suppressing them", () => {
    const html = renderToStaticMarkup(
      <Field label="Business licence" hint="PDF only">
        <Input name="businessLicenseDocument" type="file" />
      </Field>,
    );
    expect(html).toContain('type="file"');
    expect(html).toContain('name="businessLicenseDocument"');
    const id = html.match(/id="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`for="${id}"`);
    expect(html).toContain("aria-describedby=");
  });

  it("connects validation errors to their controls", () => {
    const html = renderToStaticMarkup(
      <Field label="Email" error="Email is required">
        <Input name="email" />
      </Field>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Email is required");
  });
});

describe("bilingual copy", () => {
  it("keeps English and Kiswahili translation structures in parity", () => {
    expect(leafPaths(copy.sw).sort()).toEqual(leafPaths(copy.en).sort());
  });

  it("covers every entrepreneur navigation destination", () => {
    for (const label of [
      "Overview",
      "Book a booth",
      "My bookings",
      "Sales",
      "Notifications",
      "My Feedback",
      "Profile",
      "Settings",
    ]) {
      expect(copy.en.labels[label]).toBeTruthy();
      expect(copy.sw.labels[label]).toBeTruthy();
    }
  });
});

describe("constant portal navigation", () => {
  it("keeps every entrepreneur page in the shared menu", () => {
    expect(entrepreneurNavigation().map(([path]) => path)).toEqual([
      "/portal",
      "/portal/events",
      "/portal/bookings",
      "/portal/sales",
      "/portal/notifications",
      "/portal/feedback",
      "/portal/profile",
      "/portal/settings",
    ]);
  });

  it("keeps staff pages constant while respecting role permissions", () => {
    const managerPaths = staffNavigation("manager").map(([path]) => path);
    const adminPaths = staffNavigation("admin").map(([path]) => path);
    const superadminPaths = staffNavigation("superadmin").map(([path]) => path);

    expect(managerPaths).toContain("/admin/feedback");
    expect(managerPaths).not.toContain("/admin/staff");
    expect(adminPaths).toContain("/admin/staff");
    expect(superadminPaths).toEqual(
      expect.arrayContaining([
        "/admin/staff",
        "/admin/sessions",
        "/admin/system-logs",
        "/admin/settings",
      ]),
    );
  });
});
