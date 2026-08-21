import PlayerTable from '../components/PlayerTable';

export default function PlayersPage({ catalog }) {
  return <PlayerTable catalog={catalog} meta={catalog._meta || {}} />;
}
