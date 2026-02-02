"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Mail,
  Target,
  CheckCircle2,
  Info,
  ArrowLeft,
  Shield,
} from "lucide-react";

export default function SubscribersGuidelinesPage() {
  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/guidelines">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guidelines
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Subscriber Guidelines</h1>
        <p className="text-muted-foreground">
          Subscriber management, GDPR compliance, email marketing best practices, and consent handling.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Subscriber Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Best practices for managing subscribers and ensuring compliance
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">GDPR Compliance</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Required Fields:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Email:</strong> Valid email address (required)
                            <p className="text-xs text-muted-foreground mt-1">
                              Must be unique per client
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Consent:</strong> Explicit consent required (consentGiven field)
                            <p className="text-xs text-muted-foreground mt-1">
                              Must be opt-in, not pre-checked
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Consent Date:</strong> Record when consent was given
                            <p className="text-xs text-muted-foreground mt-1">
                              Required for GDPR audit trail
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4 text-sm">Email Marketing Best Practices</h4>
                  <div className="space-y-3 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Always provide unsubscribe option in emails</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Respect unsubscribe requests immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Store unsubscribe date for compliance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Segment subscribers by preferences when possible</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
