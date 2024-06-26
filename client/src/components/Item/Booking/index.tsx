import { useState } from "react";
import Calendar from "./Calender";
import PersonSelector from "./PersonSelector";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { addToCart } from "@/lib/cart";
import Complaint from "@/components/Complaint/Complaint";
import LiveChat from "@/components/LiveChat";
import VideoCall from "@/components/VideoCall";

const Booking = ({ item }: { item: any }) => {

  const { toast } = useToast();
  const { user, appendToCart } = useAuthStore();
  const [booking, setBooking] = useState<boolean>(false);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!item._id) {
      return;
    }

    if (!startDate) {
      toast({
        title: "Please select a date",
        description: "Please select a date to continue",
      });
      return;
    }

    
    let calculatedPrice =  item.price * adults;

    calculatedPrice += item.price * 0.9 * children;

    const cartItem: any = {
      itemId: item._id,
      selectedDate: startDate,
      persons: {
        adults,
        children,
        infants,
      },
      totalPrice: calculatedPrice,
    };

    if (user?.cart.find((item: any) => item === cartItem.itemId.toString())) {
      toast({
        title: "Item already in cart",
        description: "This item is already in cart",
        variant: "destructive",
      });
      return;
    }

    try {
      setBooking(true);
      const res = await addToCart(cartItem);
      if (res) {
        appendToCart(res._id);
        toast({
          title: "Item added to cart",
          description: "Item added to cart successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: error.response.data.message,
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setBooking(false);
  };

  return (
    <div className="w-full rounded-md p-4 border gap-4 flex flex-col">
      <hr className="mb-2" />
      <h3 className="text-xl font-semibold text-yellow-600">
        Select Date & Travellers
      </h3>
      <Calendar startDate={startDate} setStartDate={setStartDate} />
      <PersonSelector
        adults={adults}
        setAdults={setAdults}
        children={children}
        setChildren={setChildren}
        infants={infants}
        setInfants={setInfants}
      />
      <button
        onClick={handleAddToCart}
        type="button"
        className="bg-yellow-600 text-white font-semibold py-2 rounded-md"
      >
        {booking ? "Adding to cart..." : "Add to cart"}
      </button>
      <Complaint item={item} />
      {/* @ts-ignore */}
      <LiveChat item={item} />
      {/* @ts-ignore */}
      <VideoCall item={item} />
    </div>
  );
};

export default Booking;
