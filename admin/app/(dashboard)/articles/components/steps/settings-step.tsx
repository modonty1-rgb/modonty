'use client';

import { ArticleStatus } from '@prisma/client';
import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FormNativeSelect } from '@/components/admin/form-field';
import { getAvailableStatuses, getStatusLabel } from '../../helpers/status-utils';

const SECTION_SPACING = 'space-y-6';
const FIELD_SPACING = 'space-y-2';

export function SettingsStep() {
  const { formData, updateField } = useArticleForm();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Publication Settings</CardTitle>
          <CardDescription>
            Control status, scheduling, and review dates for this article.
          </CardDescription>
        </CardHeader>
        <CardContent className={`${SECTION_SPACING} pt-6`}>
          {/* Status & visibility */}
          <section className={FIELD_SPACING} aria-labelledby="status-heading">
            <h3 id="status-heading" className="text-sm font-semibold text-foreground">
              Status & visibility
            </h3>
            <div className="space-y-4">
              <div className={FIELD_SPACING}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => updateField('featured', checked === true)}
                    aria-describedby="featured-desc"
                  />
                  <Label htmlFor="featured" className="cursor-pointer font-normal">
                    Featured
                  </Label>
                  {formData.featured && (
                    <Badge variant="default" className="ml-2">
                      Enabled
                    </Badge>
                  )}
                </div>
                <p id="featured-desc" className="text-xs text-muted-foreground">
                  Highlight this article in featured sections (e.g. homepage, trending) and give it higher sitemap priority (0.8).
                </p>
              </div>
              <FormNativeSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as ArticleStatus)}
              >
                {getAvailableStatuses().map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </FormNativeSelect>
            </div>
          </section>

          {/* Scheduling */}
          <section className={FIELD_SPACING} aria-labelledby="scheduling-heading">
            <h3 id="scheduling-heading" className="text-sm font-semibold text-foreground">
              Scheduling
            </h3>
            <div className="space-y-4">
              <div className={FIELD_SPACING}>
                <Label htmlFor="scheduledAt">Scheduled At</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={
                    formData.scheduledAt
                      ? new Date(formData.scheduledAt).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    updateField(
                      'scheduledAt',
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  className="h-9"
                  aria-describedby="scheduledAt-desc"
                />
                <p id="scheduledAt-desc" className="text-xs text-muted-foreground">
                  Leave empty to publish immediately or use status Draft.
                </p>
              </div>
              <div className={FIELD_SPACING}>
                <Label htmlFor="lastReviewed">Last Reviewed</Label>
                <Input
                  id="lastReviewed"
                  type="datetime-local"
                  value={
                    formData.lastReviewed
                      ? new Date(formData.lastReviewed).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    updateField(
                      'lastReviewed',
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                  className="h-9"
                  aria-describedby="lastReviewed-desc"
                />
                <p id="lastReviewed-desc" className="text-xs text-muted-foreground">
                  When content was last reviewed for accuracy.
                </p>
              </div>
            </div>
          </section>

          {/* Date Published (read-only) — no section title to avoid duplicate with field label */}
          <div className={FIELD_SPACING}>
            <Label htmlFor="datePublished" className="text-muted-foreground">
              Date Published
            </Label>
              <Input
                id="datePublished"
                type="datetime-local"
                value={
                  formData.datePublished
                    ? new Date(formData.datePublished).toISOString().slice(0, 16)
                    : ''
                }
                disabled
                readOnly
                aria-readonly="true"
                aria-describedby="datePublished-desc"
                className="h-9 bg-muted text-muted-foreground"
              />
            <p id="datePublished-desc" className="text-xs text-muted-foreground">
              Automatically set when the article is published.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
