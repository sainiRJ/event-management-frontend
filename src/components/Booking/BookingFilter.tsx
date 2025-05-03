import React from 'react';
import { Button } from "rsuite";

interface BookingFilterProps {
    onAddNewBooking: () => void;
}

const BookingFilter: React.FC<BookingFilterProps> = ({ onAddNewBooking }) => {
    return (
        <div>
            {/* Add your filter controls here */}
            <Button
                className="add-new-booking"
                onClick={onAddNewBooking}
            >
                Add New Booking
            </Button>
        </div>
    );
};

export default BookingFilter; 