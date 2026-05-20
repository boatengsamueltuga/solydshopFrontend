import { ColorRing } from "react-loader-spinner";

const Loader = () => {

    return (

        <div className="flex justify-center items-center">

            <ColorRing
                visible={true}
                height="60"
                width="60"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass="color-ring-wrapper"
                colors={[
                    "#2563eb",
                    "#3b82f6",
                    "#60a5fa",
                    "#93c5fd",
                    "#bfdbfe"
                ]}
            />

        </div>
    );
};

export default Loader;