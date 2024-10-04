import { EventType, IncrementalSource, MouseInteractions } from "@/lib/backEnd/model/types";
import { readJsonFile } from "@/lib/backEnd/util/util";
import { PpEvent } from "@/lib/shared/model/ppTypes";
import { NextRequest, NextResponse } from "next/server";

interface ReqObj {
  rrwebId: string
}

export async function POST(request: NextRequest) {
  // request validation
  const reqObj: ReqObj = await request.json();
  if (reqObj.rrwebId === undefined) {
    return new NextResponse("Bad data", { status: 400 });
  }

  // get json file
  const jsonFile: any = await readJsonFile(`${reqObj.rrwebId}.json`);
  if (jsonFile === null) {
    return new NextResponse("Cannot read json file", { status: 400 });
  }

  const snapshots: any = jsonFile.data.snapshots;

  const ppEvents: PpEvent[] = [];
  for (const snapshot of snapshots) {
    // console.log(snapshot);
    // console.log(EventType[snapshot.type]);
    if (EventType[snapshot.type] === "Meta") {
      processMetaSnapshot(snapshot, ppEvents);
    }
    if (EventType[snapshot.type] === "FullSnapshot") {
      processFullSnapshot(snapshot, ppEvents);
    }
    if (EventType[snapshot.type] === "IncrementalSnapshot") {
      processIncrementalSnapshot(snapshot, ppEvents);
    }
  }

  return new NextResponse(JSON.stringify(summarizePpEvents(ppEvents)), { status: 200 });
}

const processMetaSnapshot = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  ppEvents.push({
    type: "urlVisited",
    timestamp: snapshot.timestamp,
    data: {
      // href: new URL(snapshot.data.href).origin
      href: snapshot.data.href
    }
  });
}

const processFullSnapshot = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  ppEvents.push({
    type: "domChanged",
    timestamp: snapshot.timestamp,
  });
}

const processIncrementalSnapshot = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  if (IncrementalSource[snapshot.data.source] === "MouseMove") {
    processMouseMove(snapshot, ppEvents);
  }
  if (IncrementalSource[snapshot.data.source] === "Input") {
    processInput(snapshot, ppEvents);
  }
  if (IncrementalSource[snapshot.data.source] === "MouseInteraction" &&
    MouseInteractions[snapshot.data.type] === "Click"
  ) {
    processMouseClick(snapshot, ppEvents);
  }
}

const processMouseMove = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  ppEvents.push({
    type: "mouseMove",
    timestamp: snapshot.timestamp,
  });
}

const processInput = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  ppEvents.push({
    type: "textInput",
    timestamp: snapshot.timestamp,
    data: {
      element: "",
      value: snapshot.data.text,
    }
  });
}

const processMouseClick = (snapshot: any, ppEvents: PpEvent[]) => {
  // console.log(snapshot);
  ppEvents.push({
    type: "mouseClick",
    timestamp: snapshot.timestamp,
    data: {
      element: "",
      value: "",
    }
  });
}

const summarizePpEvents = (ppEvents: PpEvent[]): PpEvent[] => {
  // console.log(ppEvents);
  const startTs: number = ppEvents[0].timestamp;
  // collapse type
  const collapsedPpEvents: PpEvent[] = [];
  let prevPpEvent: PpEvent = ppEvents[0];
  let startPpEvent: PpEvent = ppEvents[0];
  for (const ppEvent of [...ppEvents.slice(1), { type: "dummy" } as unknown as PpEvent]) {
    if (ppEvent.type !== prevPpEvent.type) {
      collapsedPpEvents.push({
        ...prevPpEvent,
        startTime: startPpEvent.timestamp - startTs,
        endTime: prevPpEvent.timestamp - startTs
      })
      startPpEvent = ppEvent;
    }
    prevPpEvent = ppEvent;
  }
  // console.log(collapsedPpEvents);
  return collapsedPpEvents;
}