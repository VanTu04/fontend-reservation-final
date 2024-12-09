import React from 'react'
import { useSelector } from 'react-redux'
import { Alert } from 'react-bootstrap';

export const PrivateRoute = (props) => {

  const { isAuthenticated } = useSelector((state) => state.auth);
  if(!isAuthenticated){
    return<>
      <Alert variant='danger' className='mt-3'>
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <p>
          You must login to view this page!
        </p>
      </Alert>
    </>
  }
  return (
    <>
      {props.children}
    </>
  )
}
