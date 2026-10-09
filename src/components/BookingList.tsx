"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import BookingCard, { type BookingCardProps } from "./BookingCard";
import BaseModal from "./BaseModal";
import RegistrationForm from "./RegistrationForm";
import styles from "./BookingList.module.css";

export interface ColleagueOpportunity {
  id: number;
  user_id: number;
  desk_id: number;
  booking_date: string;
  active: boolean;
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

function isColleagueOpportunity(booking: unknown): booking is ColleagueOpportunity {
  return typeof booking === "object" && booking !== null &&
    "id" in booking && typeof booking.id === "number" && Number.isSafeInteger(booking.id) &&
    "user_id" in booking && typeof booking.user_id === "number" && Number.isSafeInteger(booking.user_id) &&
    "desk_id" in booking && typeof booking.desk_id === "number" && Number.isSafeInteger(booking.desk_id) &&
    "booking_date" in booking && typeof booking.booking_date === "string" &&
    "active" in booking && typeof booking.active === "boolean";
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

export function mapBookingsResponse(payload: unknown): DeskBooking[] {
  assertBookingsResponse(payload);

  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
  });

  return payload.data.map((booking) => {
    const bookingDate = new Date(booking.booking_date);
    if (Number.isNaN(bookingDate.getTime())) {
      throw new Error("Invalid booking date in response.");
    }

    return {
      id: String(booking.id),
      desk: String(booking.desk_id),
      floor: null,
      date: dateFormatter.format(bookingDate),
      active: booking.active,
    };
  });
}

export default function BookingList() {
  const [bookings, setBookings] = useState<DeskBooking[]>([]);
  const [localBookings, setLocalBookings] = useState<DeskBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

  function changeSearch(value: string) {
    if (value === search) {
      return;
    }
    setSearch(value);
  }

  function addBooking(booking: BookingCardProps) {
    const newBooking = { ...booking, id: crypto.randomUUID() };
    setLocalBookings((currentBookings) => [...currentBookings, newBooking]);
    changeSearch("");
    setSuccessMessage("Booking created successfully.");
    setIsModalOpen(false);
  }

  const query = search.trim().toLowerCase();
  const allBookings = [...bookings, ...localBookings];
  const visibleBookings = allBookings.filter((booking) =>
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
          disabled={isLoading || Boolean(fetchError)}
          onClick={() => {
            setSuccessMessage("");
            setIsModalOpen(true);
          }}
        >
          New booking
        </button>
      </div>
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create booking"
      >
        <RegistrationForm onAddBooking={addBooking} />
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
      {!isLoading && !fetchError && (
        visibleBookings.length > 0 ? (
          visibleBookings.map(({ id, ...booking }) => (
            <BookingCard key={id} {...booking} />
          ))
        ) : (
          <p>{allBookings.length === 0 ? "No bookings found." : "No bookings match your search."}</p>
        )
      )}
    </section>
  );
}