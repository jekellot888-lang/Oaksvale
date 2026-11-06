// Contact details and form delivery. The address, P.O. box and email are from the firm profile.
//
// endpoint: where the contact form POSTs (JSON, `Accept: application/json`; any 2xx counts as
//   received). Formspree, Web3Forms or the Firm's own API all fit. Left empty, the site has no
//   backend: the form opens the visitor's email app with the message written out, and says
//   plainly that nothing is sent until they press Send there.
export const contact = {
  email: 'oakshadeadvocates@gmail.com',
  address: ['Plot 3 Pilkington Road', 'NIC Building Annex, Level 1, Room B01', 'Kampala, Uganda'],
  post: ['P.O. Box 208207', 'Kampala, Uganda'],
  endpoint: '',
};
