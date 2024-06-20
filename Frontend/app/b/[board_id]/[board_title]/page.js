import Home from "@/app/ui/content-board/home";
import { getData } from "@/app/lib/api";
import PropTypes from 'prop-types';

export async function generateMetadata({ params }) {

    const fetchData = async () => {
        try {
            const data = await getData();
            if(data !== undefined && data.boards && params.board_id){
                const boardInitData = data.boards.find(item => item._id.slice(6, 14) === params.board_id);
                if(boardInitData) {
                    return boardInitData;
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const data = await fetchData();

    if(data !== undefined && data.title !== undefined){
        return {
            title: `${data.title} | Byon Task Management`,
        }
    }
    
}

export default function Page({params}) {

    return (
       <Home params={params}/>
    );
}

Page.propTypes = {
    params: PropTypes.object.isRequired
};