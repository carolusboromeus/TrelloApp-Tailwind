import DetailCardModal from "@/app/ui/content-card/DetailCard/DetailCardModal";
import { fetchAllData } from "@/app/utilities/function";
import PropTypes from 'prop-types'

export async function generateMetadata({ params }) {

  const data = await fetchAllData(params);
  if(data){
    if(data.board !== undefined && data.board.tile !== undefined && data.card !== undefined && data.card.title !== undefined){
      return {
        title: `${data.card.title} on ${data.board.title} | Byon Task Management`,
      }
    }
  }
}

export default function Page({params}) {
  return (
    <DetailCardModal params={params}/>
  )
}

Page.propTypes = {
  params: PropTypes.object.isRequired,
};