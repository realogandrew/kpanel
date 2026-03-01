/**
 * Content model. Store content entries per site (pages, posts, etc.).
 * Can be extended with types (page, post, block) and versioning later.
 */
import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    /** Type: page, post, block, etc. */
    type: { type: String, required: true, default: 'page' },
    /** URL path or slug (e.g. /about, /blog/my-post) */
    slug: { type: String, required: true, trim: true },
    title: { type: String, default: '' },
    /** Rich content (HTML, Markdown, or JSON block content) */
    body: { type: String, default: '' },
    /** Structured data (meta, blocks, etc.) */
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    /** Draft vs published */
    status: { type: String, default: 'draft', enum: ['draft', 'published', 'archived'] },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contentSchema.index({ tenantId: 1, siteId: 1, slug: 1 }, { unique: true });
contentSchema.index({ siteId: 1, type: 1, status: 1 });

export const Content = mongoose.model('Content', contentSchema);
