Hackathon Project for ETH NYC

General Workflow from Slideshow:
Client deploys smart contract
Client deposits funds and sets up a payment stream to service provider(s) through contract
UMA Optimistic Oracle is used to determine service provider’s performance
For this project, the client creates an Oracle request when they believe performance is not met
Oracle settlement calls callback function to delete payment stream and withdraw funds back to client
