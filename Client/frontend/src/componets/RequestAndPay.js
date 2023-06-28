import React, { useState, useEffect } from "react";
import { DollarOutlined, SwapOutlined } from "@ant-design/icons";
import { Modal, Input, InputNumber } from "antd";
import {
  usePrepareContractWrite,
  useWaitForTransaction,
  useContractWrite,
} from "wagmi";
import { polygonMumbai } from "@wagmi/chains";
import ABI from "../abi.json";

function RequestAndPay({ request, getNameAndBalance }) {
  const [payModal, setPayModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState(5);
  const [requestAddress, setRequestAddress] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const { config } = usePrepareContractWrite({
    chainId: polygonMumbai.id,
    address: "0x66Ac9f2F58fBAC56F050b0e47C01c963698b295a",
    abi: ABI,
    functionName: "payRequest",
    args: [0],
    overrides: {
      value: String(Number(request["1"][0] * 1e18)),
    },
  });

  const { write, data } = useContractWrite(config);

  const { config: configRequest } = useContractWrite({
    chainId: polygonMumbai.id,
    address: "0x66Ac9f2F58fBAC56F050b0e47C01c963698b295a",
    abi: ABI,
    functionName: "createRequest",
    args: [requestAddress, requestAmount, requestMessage],
  });
  //console.log(requestAmount, requestAmount, requestMessage);

  const { write: writeRequest, data: dataRequest } =
    useContractWrite(configRequest);

  const { isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const { isSuccess: isSuccessRequest } = useWaitForTransaction({
    hash: dataRequest?.hash,
  });

  const showPayModal = () => {
    setPayModal(true);
  };
  const hidePayModal = () => {
    setPayModal(false);
  };

  const showRequestModal = () => {
    setRequestModal(true);
  };
  const hideRequestModal = () => {
    setRequestModal(false);
  };
  useEffect(() => {
    if (isSuccess || isSuccessRequest) {
      getNameAndBalance();
    }
  }, [isSuccess, isSuccessRequest]);

  return (
    <>
      <Modal
        title="Confirm Payment"
        open={payModal}
        onOk={() => {
          write?.();
          hidePayModal();
        }}
        onCancel={hidePayModal}
        okText="Proceed To Pay"
        cancelText="Cancel"
      >
        {request && request["0"].length > 0 && (
          <>
            <h2>Sending payment to {request["3"][0]} </h2>
            <h3>Value: {request["1"][0]} </h3>
            <p>"{request["2"][0]} "</p>
          </>
        )}
      </Modal>
      <Modal
        title="Request A Payment"
        open={requestModal}
        onOk={() => {
          writeRequest?.();
          hideRequestModal();
        }}
        onCancel={hideRequestModal}
        okText="Proceed To Request"
        cancelText="Cancel"
      >
        <p>Amount (Matic)</p>
        <InputNumber
          value={requestAmount}
          onChange={(val) => setRequestAmount(val)}
        />
        <p>From (address)</p>
        <Input
          placeholder="0x..."
          value={requestAddress}
          onChange={(val) => setRequestAddress(val.target.value)}
        />
        <p>Message</p>
        <Input
          placeholder="Lunch Bill..."
          value={requestMessage}
          onChange={(val) => setRequestMessage(val.target.value)}
        />
      </Modal>
      <div className="requestAndPay">
        <div
          className="quickOption"
          onClick={() => {
            showPayModal();
          }}
        >
          <DollarOutlined style={{ fontSize: "26px" }} />
          Pay
          {request && request["0"].length > 0 && (
            <div className="numReqs">{request["0"].length}</div>
          )}
        </div>
        <div
          className="quickOption"
          onClick={() => {
            showRequestModal();
          }}
        >
          <SwapOutlined style={{ fontSize: "26px" }} />
          Request
        </div>
      </div>
    </>
  );
}

export default RequestAndPay;
