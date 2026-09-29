export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getAllVisibilityItems,
  updateVisibilityItem,
  updateBulkVisibility,
  updateGroupVisibility,
  resetAllVisibility,
  upsertCustomVisibilityItem,
  seedAllDefaultVisibilityItems,
} from "../../../../lib/visibility";

export async function GET() {
  try {
    const { items, settings } = await getAllVisibilityItems();

    const counts = {
      total: items.length,
      visible: items.filter((i) => i.is_visible).length,
      hidden: items.filter((i) => !i.is_visible).length,
      pages: items.filter((i) => i.type === "page").length,
      sections: items.filter((i) => i.type === "section").length,
      widgets: items.filter((i) => i.type === "widget").length,
    };

    return NextResponse.json(
      { success: true, items, settings, counts },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    if (body.action === "reseed") {
      await seedAllDefaultVisibilityItems();
      return NextResponse.json({
        success: true,
        message: "All 40 default pages, sections and widgets synchronized into database!",
      });
    }

    if (body.action === "reset_all") {
      await seedAllDefaultVisibilityItems();
      await resetAllVisibility();
      return NextResponse.json({
        success: true,
        message: "All pages and sections reset to VISIBLE.",
      });
    }

    if (body.action === "upsert" && body.item) {
      const res = await upsertCustomVisibilityItem(body.item);
      return NextResponse.json({
        success: true,
        message: `Saved '${body.item.name || body.item.id}' successfully!`,
        item: res.item,
      });
    }

    if (body.page_group && body.is_visible !== undefined) {
      await updateGroupVisibility(body.page_group, body.is_visible);
      return NextResponse.json({
        success: true,
        message: `${body.is_visible ? "Enabled" : "Disabled"} all sections for '${body.page_group}'.`,
      });
    }

    if (Array.isArray(body.ids) && body.is_visible !== undefined) {
      await updateBulkVisibility(body.ids, body.is_visible);
      return NextResponse.json({
        success: true,
        message: `Updated ${body.ids.length} item(s) to ${body.is_visible ? "Visible" : "Hidden"}.`,
      });
    }

    if (body.id && body.is_visible !== undefined) {
      await updateVisibilityItem(body.id, body.is_visible);
      return NextResponse.json({
        success: true,
        message: `Item '${body.id}' is now ${body.is_visible ? "VISIBLE" : "HIDDEN"}.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid visibility update payload." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
