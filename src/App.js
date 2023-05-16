import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

function App() {
    // State variables
    const [songs, setSongs] = useState([]); // Store the list of songs
    const [searchId, setSearchId] = useState(""); // Store the search ID
    const [selectedSong, setSelectedSong] = useState(null); // Store the selected song
    const [newSong, setNewSong] = useState({
        title: "",
        artist: "",
        year: "",
        img_url: "",
        url: "",
    });// Store the new song details
    const [showForm, setShowForm] = useState(false); // Toggle form visibility
    const [alertMessage, setAlertMessage] = useState(""); // Store alert message

    useEffect(() => {
        // Fetch all songs from the API when the component mounts
        fetch("https://fullstack-p2-api.onrender.com/api/getall")
            .then((res) => res.json())
            .then((data) => setSongs(data))
            .catch((error) => console.error(error));
    }, []);

    const handleSearch = (event) => {
        // Handle search form submission
        event.preventDefault();
        if (searchId) {
            setSelectedSong(null); // Reset selectedSong state to null
            setAlertMessage(""); // Clear any previous error message
            // Fetch the song with the specified ID
            fetch(`https://fullstack-p2-api.onrender.com/api/songs/${searchId}`)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        throw new Error("Song not found");
                    }
                })
                .then((data) => {
                    setSelectedSong(data); // Set the selected song
                    setShowForm(false); // Hide the form
                })
                .catch((error) => {
                    console.error(error);
                    setAlertMessage("Song not found"); // Set error message
                });
        }
    };

    const handleUpdate = (event) => {
        // Handle update form submission
        event.preventDefault();
        const { title, artist, year, img_url, url } = selectedSong;
        const updatedSong = {
            title,
            artist,
            year,
            img_url,
            url,
        };

        // Update the song with the specified ID
        fetch(
            `https://fullstack-p2-api.onrender.com/api/songs/${selectedSong._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedSong),
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // Update the songs array with the updated song
                const updatedSongs = songs.map((song) => {
                    if (song._id === data._id) {
                        return data;
                    }
                    return song;
                });
                setSongs(updatedSongs); // Update the songs state
                setSelectedSong(data); // Update the selectedSong state
                setShowForm(false); // Hide the form
            })
            .catch((error) => console.error(error));
    };

    const handleDelete = (event) => {
        // Handle delete button click
        event.preventDefault();
        // Delete the song with the specified ID
        fetch(
            `https://fullstack-p2-api.onrender.com/api/songs/${selectedSong._id}`,
            {
                method: "DELETE",
            }
        )
            .then((res) => res.json())
            .then(() => {
                // Remove the deleted song from the songs array
                const updatedSongs = songs.filter(
                    (song) => song._id !== selectedSong._id
                );
                setSongs(updatedSongs); // Update the songs state
                setSelectedSong(null); // Reset selectedSong state
                setShowForm(false); // Hide the form
            })
            .catch((error) => console.error(error));
    };

    const handleAdd = (event) => {
        // Handle add form submission
        event.preventDefault();
        // Add the new song to the API
        fetch("https://fullstack-p2-api.onrender.com/api/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newSong),
        })
            .then((res) => res.json())
            .then((data) => {
                // Add the new song to the songs array
                setSongs([...songs, data]);
                setNewSong({
                    title: "",
                    artist: "",
                    year: "",
                    img_url: "",
                    url: "",
                });
                setShowForm(false); // Hide the form
            })
            .catch((error) => console.error(error));
    };

    return (
        <Container fluid className="app-container">
            <div className="left">
                <Row>
                    <Col>
                        <h1>All Songs</h1>
                        {songs.map((song) => (
                            <div key={song._id}>
                                <h4>
                                    {song.title} - {song.artist}
                                </h4>
                                <p>id: {song._id}</p>
                            </div>
                        ))}
                    </Col>
                </Row>
            </div>
            <div className="right">
                <Row>
                    <Col>
                        <div className="id-form">
                            <h1>Song Details</h1>
                            {alertMessage && (
                                <Alert variant="danger">{alertMessage}</Alert>
                            )}
                            <Form onSubmit={handleSearch}>
                                <Form.Group controlId="search">
                                    <Form.Label>Enter Song ID:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter song ID"
                                        onChange={(event) =>
                                            setSearchId(event.target.value)
                                        }
                                    />
                                </Form.Group>
                                <Button type="submit">Search</Button>
                            </Form>
                        </div>
                        {selectedSong && (
                            <div>
                                <h1>Song Details</h1>
                                <h6>Title: {selectedSong.title}</h6>
                                <h6>Artist: {selectedSong.artist}</h6>
                                <h6>Year: {selectedSong.year}</h6>
                                <img
                                    src={selectedSong.img_url}
                                    alt="album poster"
                                />
                                {selectedSong.url ? (
                                    <audio controls>
                                        <source
                                            src={selectedSong.url}
                                            type="audio/mp3"
                                        />
                                    </audio>
                                ) : (
                                    <p>
                                        This song does not have an audio file.
                                    </p>
                                )}
                                <div className="buttons">
                                    <Button
                                        variant="warning"
                                        onClick={() => setShowForm(true)}
                                    >
                                        Edit Song Details
                                    </Button>{" "}
                                    <Button
                                        variant="danger"
                                        onClick={handleDelete}
                                    >
                                        Delete Song from Database
                                    </Button>
                                </div>
                            </div>
                        )}
                        {showForm && selectedSong && (
                            <div className="edit">
                                <h1> Edit Song Details</h1>
                                <Form onSubmit={handleUpdate}>
                                    <Form.Group controlId="title">
                                        <Form.Label>Title:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedSong.title}
                                            onChange={(event) =>
                                                setSelectedSong({
                                                    ...selectedSong,
                                                    title: event.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="artist">
                                        <Form.Label>Artist:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedSong.artist}
                                            onChange={(event) =>
                                                setSelectedSong({
                                                    ...selectedSong,
                                                    artist: event.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="year">
                                        <Form.Label>Year:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedSong.year}
                                            onChange={(event) =>
                                                setSelectedSong({
                                                    ...selectedSong,
                                                    year: event.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="img_url">
                                        <Form.Label>Image URL:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedSong.img_url}
                                            onChange={(event) =>
                                                setSelectedSong({
                                                    ...selectedSong,
                                                    img_url: event.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="url">
                                        <Form.Label>Song URL:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedSong.url}
                                            onChange={(event) =>
                                                setSelectedSong({
                                                    ...selectedSong,
                                                    url: event.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Button variant="success" type="submit">
                                        Update
                                    </Button>{" "}
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Form>
                            </div>
                        )}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div>
                            <h1>Add Song</h1>
                            <Form onSubmit={handleAdd}>
                                <Form.Group>
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Title"
                                        value={newSong.title}
                                        onChange={(event) =>
                                            setNewSong({
                                                ...newSong,
                                                title: event.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Artist</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Artist"
                                        value={newSong.artist}
                                        onChange={(event) =>
                                            setNewSong({
                                                ...newSong,
                                                artist: event.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Year</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Year"
                                        value={newSong.year}
                                        onChange={(event) =>
                                            setNewSong({
                                                ...newSong,
                                                year: event.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Image URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Image URL"
                                        value={newSong.img_url}
                                        onChange={(event) =>
                                            setNewSong({
                                                ...newSong,
                                                img_url: event.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Song URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Song URL"
                                        value={newSong.url}
                                        onChange={(event) =>
                                            setNewSong({
                                                ...newSong,
                                                url: event.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Button type="submit">Add Song</Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default App;