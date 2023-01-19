// Have a function to enter the lottery
import { useWeb3Contract } from "react-moralis";
import { contractAdresses, abi } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Bell, Button, Loading } from "web3uikit";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const lotteryAddress =
    chainId in contractAdresses ? contractAdresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification();

  const {
    runContractFunction: enterLottery,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  /* View Functions */
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUIValues() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall = await getRecentWinner();
    setEntranceFee(entranceFeeFromCall);
    setNumberOfPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);
  // no list means it'll update everytime anything changes or happens
  // empty list means it'll run once after the initial rendering
  // and dependencies mean it'll run whenever those things in the list change

  // An example filter for listening for events, we will learn more on this next Front end lesson
  // const filter = {
  //     address: lotteryAddress,
  //     topics: [
  //         // the name of the event, parnetheses containing the data type of each event, no spaces
  //         utils.id("EnterLottery(address)"),
  //     ],
  // }

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      updateUIValues();
      handleNewNotification(tx);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-5">
      <h3 className="py-4 px-4 font-bold text-3xl"> Participate? </h3>
      {lotteryAddress ? (
        <div>
          {isLoading || isFetching ? (
            <Loading size={30} spinnerColor="#2E7DAF" />
          ) : (
            <Button
              color="blue"
              theme="colored"
              type="button"
              text="Enter lottery"
              onClick={async () => {
                await enterLottery({
                  onSuccess: handleSuccess, //OnSuccess only checks to see if transaction was succesfully send to metamask
                  onError: (error) => console.log(error),
                });
              }}
              disabled={isLoading || isFetching}
            />
          )}
          <p>Entrance fee: {ethers.utils.formatUnits(entranceFee, 18)} ETH</p>
          <div>Number of participants: {numberOfPlayers}</div>
          <div>Recent winner: {recentWinner}</div>
          <div>Another Try?</div>
        </div>
      ) : (
        <div> No Lottery Address detected</div>
      )}
    </div>
  );
}
