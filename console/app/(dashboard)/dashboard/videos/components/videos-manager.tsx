"use client";

import { useState } from "react";
import { Video } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ReelCard } from "../../reels/components/reels-manager";
import type { ClientReel } from "../../reels/actions/reels-actions";
import { VideoUpload } from "@/components/media/video-upload";
import {
  createVideoUploadTicket,
  finalizeVideoReel,
  getVideoEncodingState,
} from "../actions/video-actions";

/**
 * The video half of the reels (ق8). Management is identical to an image reel — same card,
 * same fields, same queue — so only the upload differs, and that is the whole reason the
 * two live on separate routes.
 */
export function VideosManager({ initial }: { initial: ClientReel[] }) {
  const [videos, setVideos] = useState<ClientReel[]>(initial);

  return (
    <div className="space-y-5">
      {/* A finished upload has to bring back the row Bunny just encoded — reloading is the
          honest way to get it, since the thumbnail only exists once encoding ends. */}
      <VideoUpload
        createTicket={createVideoUploadTicket}
        finalize={finalizeVideoReel}
        getEncodingState={getVideoEncodingState}
        maxDurationSec={90}
        requireVertical
        labels={{
          idle: "ارفع مقطعاً",
          hint: "MP4 أو MOV أو WebM · طولي 1080 × 1920 · لين ٩٠ ثانية",
          done: "جاهز — اكتب العنوان والوصف عشان نعتمده",
        }}
        onDone={() => window.location.reload()}
      />

      {videos.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Video className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ما فيه فيديوهات بعد.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {videos.map((v) => (
            <ReelCard
              key={v.id}
              reel={v}
              onRemoved={() => setVideos((prev) => prev.filter((x) => x.id !== v.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
