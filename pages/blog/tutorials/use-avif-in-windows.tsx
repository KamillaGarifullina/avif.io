import Blog from "@components/Blog";
import H from "@components/H";
import SmartLink from "@components/SmartLink";

import { useAvifInWindows as postdata } from "lib/meta";
import { useAvifInEdge as post1 } from "lib/meta";
import { useAvifInWordpress as post2 } from "lib/meta";
import { useAvifInGimp as post3 } from "lib/meta";

import { useState } from "react";
import ContentTable, { ContentTableEntry } from "@components/ContentTable";

export default function BlogPost() {
  const [contentTable, setContentTable] = useState<ContentTableEntry[]>([]);

  function contentTableCallback(entry: ContentTableEntry) {
    contentTable.push(entry);
    setContentTable([...contentTable]);
  }
  return (
    <Blog postdata={postdata} posts={[post1, post2, post3]}>
      <ContentTable contentTable={contentTable} />
      <H contentTableCallback={contentTableCallback} level={2} text="Microsoft supports AVIF" />
      AVIF got a significant boost when Microsoft decided to add support for it in the Windows 10
      May 2019 Update. Windows 10 does not support the AVIF image format natively, but the software
      giant has incorporated this functionality into some of its core programs, notably the File
      Explorer and Paint program. As long as you have the correct AV1 video codec from the Microsoft
      Store installed on your computer, you can view AVIF images natively within Windows 10 apps
      like Paint and File Explorer.
      <H contentTableCallback={contentTableCallback} level={2} text="With an extension" />
      Without proper configuration, tools like Microsoft Paint throw a bug that says that the AVIF
      file is not a valid format and is not supported by the application. If you are looking for
      AVIF support for Windows 10, you can either wait until Microsoft implements it by default, or
      take a look
      <SmartLink
        link="
      https://microsoft.com/de-de/p/av1-video-extension/9mvzqvxjbq9v"
        text="at the extension."
      />
      AV1 extension has been around since Windows 10 version 1809, when support for the AV1 video
      format first appeared. Since version 1903, the extension is also able to process AVIF files.
      <H contentTableCallback={contentTableCallback} level={2} text="Results" />
      As you can see on the screenshot below, after installing the extension, File Explorer
      generates a thumbnail image for the AVIF image format. Additionally, MSPaint allows editing
      and saving these images. You may want to use a more advanced image editor than Paint to work
      on image files such as AVIF. For more details, see our
      <SmartLink text="article about GIMP." link="/blog/tutorials/use-avif-in-gimp/" />
    </Blog>
  );
}
