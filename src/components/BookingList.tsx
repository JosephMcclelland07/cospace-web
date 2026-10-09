"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import BookingCard, { type BookingCardProps, type DeskOption } from "./BookingCard";
import BaseModal from "./BaseModal";
import RegistrationForm from "./RegistrationForm";
import AuthForm from "./AuthForm";
import styles from "./BookingList.module.css";

export interface ColleagueOpportunity {
  id: number;
  user_id: number;
  desk_id: number;
  booking_date: string;
  active: boolean;
  desk: DeskOption;
}

interface ColleagueOpportunitiesResponse {
  data: ColleagueOpportunity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type DeskBooking = BookingCardProps & { id: string };

function isDeskOption(value: unknown): value is DeskOption {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" && Number.isSafeInteger(value.id) &&
    "name" in value && typeof value.name === "string" &&
    "floor" in value && typeof value.floor === "number" && Number.isSafeInteger(value.floor);
}

function isColleagueOpportunity(booking: unknown): booking is ColleagueOpportunity {
  return typeof booking === "object" && booking !== null &&
    "id" in booking && typeof booking.id === "number" && Number.isSafeInteger(booking.id) &&
    "user_id" in booking && typeof booking.user_id === "number" && Number.isSafeInteger(booking.user_id) &&
    "desk_id" in booking && typeof booking.desk_id === "number" && Number.isSafeInteger(booking.desk_id) &&
    "booking_date" in booking && typeof booking.booking_date === "string" &&
    "active" in booking && typeof booking.active === "boolean" &&
    "desk" in booking && isDeskOption(booking.desk);
}

function assertBookingsResponse(payload: unknown): asserts payload is ColleagueOpportunitiesResponse {
  if (typeof payload !== "object" || payload === null ||
      !("data" in payload) || !Array.isArray(payload.data) ||
      !payload.data.every((booking: unknown) => isColleagueOpportunity(booking)) ||
      !("meta" in payload) || typeof payload.meta !== "object" || payload.meta === null) {
    throw new Error("Unexpected bookings response.");
  }

  const meta = payload.meta;
  if (!("page" in meta) || typeof meta.page !== "number" || meta.page < 1 ||
      !("limit" in meta) || typeof meta.limit !== "number" || meta.limit < 1 ||
      !("total" in meta) || typeof meta.total !== "number" || meta.total < 0 ||
      !("totalPages" in meta) || typeof meta.totalPages !== "number" || meta.totalPages < 0 ||
      ![meta.page, meta.limit, meta.total, meta.totalPages].every(Number.isSafeInteger)) {
    throw new Error("Unexpected bookings pagination.");
  }
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
  });

function mapBooking(booking: ColleagueOpportunity): DeskBooking {
  const bookingDate = new Date(booking.booking_date);
  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error("Invalid booking date in response.");
  }

  return {
    id: String(booking.id),
    desk: booking.desk.name,
    floor: booking.desk.floor,
    date: dateFormatter.format(bookingDate),
    active: booking.active,
  };
}

export function mapBookingsResponse(payload: unknown): DeskBooking[] {
  assertBookingsResponse(payload);
  return payload.data.map(mapBooking);
}

export default function BookingList() {
  const [bookings, setBookings] = useState<DeskBooking[]>([]);
  const [desks, setDesks] = useState<DeskOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDesks, setIsLoadingDesks] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [deskError, setDeskError] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    async function loadBookings() {
      try {
        const response = await api.get<ColleagueOpportunitiesResponse>("/bookings", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setBookings(mapBookingsResponse(response.data));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          if (isAxiosError(error)) {
            if (!error.response) {
              setFetchError("The database server is currently offline. Please check your connection.");
            } else {
              setFetchError("The server could not load your bookings. Please try again later.");
            }
          } else {
            setFetchError("The booking service returned an unexpected response. Please try again later.");
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadBookings();
    return () => {
      controller.abort();
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDesks() {
      try {
        const response = await api.get<unknown>("/desks", { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data) || !response.data.every(isDeskOption)) {
          throw new Error("The desk service returned an unexpected response.");
        }
        setDesks(response.data);
        if (response.data.length === 0) {
          setDeskError("No desks are configured yet.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDeskError(error instanceof Error ? error.message : "Could not load desks.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingDesks(false);
      }
    }

    void loadDesks();
    return () => controller.abort();
  }, []);

  function changeSearch(value: string) {
    if (value === search) {
      return;
    }
    setSearch(value);
  }

  function acceptAuthentication(token: string) {
    window.sessionStorage.setItem("cospace_auth_token", token);
    setAuthToken(token);
    setAuthNotice("");
  }

  function signOut() {
    window.sessionStorage.removeItem("cospace_auth_token");
    setAuthToken("");
  }

  async function addBooking(booking: { deskId: number; date: string }) {
    try {
      const response = await api.post<ColleagueOpportunity>(
        "/bookings",
        {
          desk_id: booking.deskId,
          booking_date: new Date(`${booking.date}T00:00:00.000Z`).toISOString(),
          active: true,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      const createdBooking = mapBooking(response.data);
      setBookings((currentBookings) => [...currentBookings, createdBooking]);
      changeSearch("");
      setSuccessMessage("Booking created successfully.");
      setIsModalOpen(false);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        signOut();
        setAuthNotice("Your session expired. Sign in again to continue.");
      }
      const responseMessage = isAxiosError(error) &&
        typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : null;
      throw new Error(responseMessage ?? "Booking could not be saved. Please try again.");
    }
  }

  const query = search.trim().toLowerCase();
  const visibleBookings = bookings.filter((booking) =>
    [booking.desk, booking.floor === null ? "" : `Floor ${booking.floor}`, booking.date].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );

  return (
    <section className={styles.list} aria-labelledby="bookings-heading">
      <div className={styles.toolbar}>
        <h1 id="bookings-heading">Desk bookings</h1>
        <button
          type="button"
          className={styles.newBooking}
          aria-haspopup="dialog"
          disabled={isLoading || Boolean(fetchError) || isLoadingDesks || Boolean(deskError)}
          onClick={() => {
            setAuthToken(window.sessionStorage.getItem("cospace_auth_token") ?? "");
            setSuccessMessage("");
            setAuthNotice("");
            setIsModalOpen(true);
          }}
        >
          New booking
        </button>
        {authToken && (
          <button type="button" className={styles.signOut} onClick={signOut}>
            Sign out
          </button>
        )}
      </div>
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create booking"
      >
        {authToken ? (
          <RegistrationForm desks={desks} onAddBooking={addBooking} />
        ) : (
          <AuthForm notice={authNotice} onAuthenticated={acceptAuthentication} />
        )}
      </BaseModal>

      <div className={styles.search}>
        <label htmlFor="booking-search">Search bookings</label>
        <input
          id="booking-search"
          type="search"
          placeholder="Desk, floor, or date"
          value={search}
          onChange={(event) => changeSearch(event.currentTarget.value)}
        />
      </div>

      <p role="status">
        {isLoading ? "Loading..." : !fetchError && (
          <>
            {successMessage && `${successMessage} `}
            {visibleBookings.length} {visibleBookings.length === 1 ? "booking" : "bookings"}
          </>
        )}
      </p>

      {fetchError && (
        <div role="alert" className={styles.errorAlert}>
          <strong>Bookings unavailable</strong>
          <p>{fetchError}</p>
        </div>
      )}
      {deskError && <p role="alert" className={styles.errorAlert}>{deskError}</p>}
      {!isLoading && !fetchError && (
        visibleBookings.length > 0 ? (
          visibleBookings.map(({ id, ...booking }) => (
            <BookingCard key={id} {...booking} />
          ))
        ) : (
          <p>{bookings.length === 0 ? "No bookings found." : "No bookings match your search."}</p>
        )
      )}
    </section>
  );
}