"use client";

import axios from "axios";
import styles from "./page.module.css";
import { useState } from "react";
import { PpEvent } from "@/lib/shared/model/ppTypes";

export default function Home() {
  const [viewState, setViewState] = useState<ViewStates>("init");
  const [ppEvents, setPpEvents] = useState<PpEvent[]>([]);

  const handleCreateSummary = async () => {
    setViewState("loading");
    try {
      const rsp = await axios.post("/api/create-summary",
        { rrwebId: "f116dbf8-f2a2-4b1c-b160-bd295342a645" }
      )
      console.log(rsp.data);
      setPpEvents(rsp.data);
      setViewState("summary");
    } catch (e) {
      console.log("API Error");
      setViewState("error");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {viewState === "init" ? (
          <button onClick={handleCreateSummary}
            style={{
              fontSize: '18px',
              padding: '12px 24px'
            }} >
            Create Summary
          </button>
        ) : viewState === "loading" ? (
          <p>Loading...</p>
        ) : viewState === "summary" ? (
          <>
            <p style={{
              fontSize: '18px'
            }} >Summary</p>
            <table className="table table-striped" >
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {ppEvents.map((event, index) => (
                  <tr key={index}>
                    <td>{event.type}</td>
                    <td>
                      {new Date(event.startTime as number).toLocaleTimeString([], {
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      {new Date(event.endTime as number).toLocaleTimeString([], {
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      <ul>
                        {event.data !== undefined && Object.entries(event.data).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong>{' '}
                            {value.toString().length > 50
                              ? value.toString().substring(0, 50) + '...'
                              : value}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>There was an API Error!</p>
        )}
      </main>
    </div >
  );
}

type ViewStates = "init" | "loading" | "error" | "summary";