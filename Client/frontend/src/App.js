import "./App.css";
import logo from "./logo.png";
import { Layout, Button } from "antd";
import CurrentBalance from "./componets/CurrentBalance";
import RequestAndPay from "./componets/RequestAndPay";
import AccountDetails from "./componets/AccountDetails";
import RecentActivity from "./componets/RecentActivity";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import axios from "axios";
import { useState, useEffect } from "react";

const { Header, Content } = Layout;

function App() {

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });

  const [name, setName] = useState("...");
  const [balance, setBalance] = useState("...");
  const [dollar, setDollar] = useState("...");
  const [history, setHistory] = useState(null);
  const [request, setRequest] = useState({ "1": [0], "0": [] });

  
  function disconnectAndSetNull() {
    disconnect();
    setBalance("...");
    setDollar("...");
    setHistory(null);
    setRequest({ "1": [0], "0": [] });
  }

  async function getNameAndBalance() {
    const res = await axios.get(`http://localhost:3001/getNameAndBalance`, {
      params: { userAddress: address },
    });
    const response = res.data;
    console.log(response);

    if (response.name[1]) {
      setName(response.name[0]);
    }
    setBalance(String(response.balance));
    setDollar(String(response.dollar));
    setHistory(response.history);
    setRequest(response.request);
  }

  useEffect(() => {
    if (!isConnected) return;
    getNameAndBalance();
  }, [isConnected]);
  return (
    <div className="App">
      <Layout>
        <Header className="header">
          <div className="headerLeft">
            
            {isConnected && (
              <>
                <div
                  className="menuOption"
                  style={{ borderBottom: "1.5px solid black" }}
                >
                  Summary
                </div>
                
              </>
            )}
          </div>
          {isConnected ? (
            <Button type={"primary"} onClick={disconnectAndSetNull}>
              Disconnect
            </Button>
          ) : (
            <Button
              type={"primary"}
              onClick={() => {
                connect();
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Header>
        <Content className="content">
          {isConnected ? (
            <>
              <div className="firstColumn">
                <CurrentBalance dollars={dollar} />
                <RequestAndPay
                  request={request}
                  getNameAndBalance={getNameAndBalance}
                />
                <AccountDetails
                  address={address}
                  name={name}
                  balance={balance}
                />
              </div>
              <div className="secondColumn">
                <RecentActivity history={history} />
              </div>
            </>
          ) : (
            <div> Please Connect The Wallet</div>
          )}
        </Content>
      </Layout>
    </div>
  );
}

export default App;
