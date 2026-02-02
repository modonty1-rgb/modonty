import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PreviewAuthorBioProps {
  author: {
    name: string;
    slug: string | null;
    image: string | null;
    jobTitle: string | null;
    bio: string | null;
  };
}

export function PreviewAuthorBio({ author }: PreviewAuthorBioProps) {
  return (
    <section className="my-8 md:my-12" aria-labelledby="author-heading">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <h2 id="author-heading" className="text-xl font-semibold mb-4">
            عن الكاتب
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {author.image && (
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={author.image} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
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
                <p className="text-sm text-muted-foreground mb-1">{author.jobTitle}</p>
              )}
              {author.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
