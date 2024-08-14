type Props = {
  params: {
    id: string;
  };
};

const CampaignDetail = ({ params: { id } }: Props) => {
  return (
    <div>
      <h1>{id}</h1>
    </div>
  );
};

export default CampaignDetail;
