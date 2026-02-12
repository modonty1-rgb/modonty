import Link from "@/components/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Twitter, Facebook } from "lucide-react";

interface ArticleAuthorBioProps {
  author: {
    name: string;
    slug: string | null;
    image: string | null;
    jobTitle: string | null;
    bio: string | null;
    credentials: string[];
    expertiseAreas: string[];
    linkedIn: string | null;
    twitter: string | null;
    facebook: string | null;
  };
}

export function ArticleAuthorBio({ author }: ArticleAuthorBioProps) {
  return (
    <section className="my-8 md:my-12" aria-labelledby="author-heading">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 id="author-heading" className="text-xl font-semibold mb-4">عن الكاتب</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {author.image && (
              <Avatar className="h-20 w-20">
                <AvatarImage src={author.image} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {author.slug ? (
                  <Link
                    href={`/users/${author.slug}`}
                    className="text-lg font-semibold underline hover:text-primary"
                  >
                    {author.name}
                  </Link>
                ) : (
                  <h3 className="text-lg font-semibold">{author.name}</h3>
                )}
              </div>
              {author.jobTitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  {author.jobTitle}
                </p>
              )}
              {author.bio && (
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  {author.bio}
                </p>
              )}
              {(author.credentials?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {author.credentials.map((credential, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {credential}
                    </Badge>
                  ))}
                </div>
              )}
              {(author.expertiseAreas?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {author.expertiseAreas.map((area, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-4">
                {author.linkedIn && (
                  <Link
                    href={author.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                )}
                {author.twitter && (
                  <Link
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Twitter Profile"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
                {author.facebook && (
                  <Link
                    href={author.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Facebook Profile"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
